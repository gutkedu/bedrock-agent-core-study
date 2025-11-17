"""
Lambda function to interact with a coordinator agent via A2A protocol.

This Lambda acts as a proxy between API Gateway and a Bedrock AgentCore coordinator agent.
It accepts HTTP requests with a message, forwards it to the agent using A2A client,
and returns the agent's response.

Environment Variables:
    COORDINATOR_AGENT_URL: The AgentCore runtime URL for the coordinator agent
    BEARER_TOKEN: Authorization bearer token for the agent
    AWS_REGION: AWS region (automatically set by Lambda runtime)
"""
import asyncio
import json
import logging
import os
from uuid import uuid4

import httpx
from a2a.client import A2ACardResolver, ClientConfig, ClientFactory
from a2a.types import Message, Part, Role, TextPart

logger = logging.getLogger()
logger.setLevel(logging.INFO)

DEFAULT_TIMEOUT = 300  # 5 minutes


def create_message(*, role: Role = Role.user, text: str) -> Message:
    """Create an A2A message with the given text."""
    return Message(
        kind="message",
        role=role,
        parts=[Part(TextPart(kind="text", text=text))],
        message_id=uuid4().hex,
    )


async def send_to_coordinator(message: str, runtime_url: str, bearer_token: str) -> dict:
    """
    Send a message to the coordinator agent and return the response.
    
    Args:
        message: The user message to send
        runtime_url: Base URL of the coordinator agent runtime
        bearer_token: Authorization token
        
    Returns:
        dict with 'success', 'response', and optional 'error' keys
    """
    session_id = str(uuid4())
    logger.info(f"Sending message to coordinator agent. Session ID: {session_id}")

    headers = {
        "Authorization": f"Bearer {bearer_token}",
        "X-Amzn-Bedrock-AgentCore-Runtime-Session-Id": session_id,
    }

    try:
        async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT, headers=headers) as httpx_client:
            # Fetch the agent card
            resolver = A2ACardResolver(httpx_client=httpx_client, base_url=runtime_url)
            agent_card = await resolver.get_agent_card()
            logger.info(f"Retrieved agent card for coordinator")

            # Create A2A client
            config = ClientConfig(httpx_client=httpx_client, streaming=False)
            factory = ClientFactory(config)
            client = factory.create(agent_card)

            # Send message and process response
            msg = create_message(text=message)
            
            async for event in client.send_message(msg):
                logger.info(f"Received event type: {type(event)}")
                
                if isinstance(event, Message):
                    # Extract text from message parts
                    text_parts = [part.text for part in event.parts if isinstance(part, TextPart)]
                    response_text = " ".join(text_parts) if text_parts else "No text content in response"
                    return {"success": True, "response": response_text}
                
                elif isinstance(event, tuple) and len(event) == 2:
                    # Handle (Task, UpdateEvent) tuple
                    task, update_event = event
                    
                    if hasattr(task, 'artifacts') and task.artifacts:
                        for artifact in task.artifacts:
                            if hasattr(artifact, 'parts') and artifact.parts:
                                for part in artifact.parts:
                                    if hasattr(part, 'root') and isinstance(part.root, TextPart):
                                        response_text = part.root.text
                                        return {"success": True, "response": response_text}
                
                # Fallback for unexpected event types
                return {"success": True, "response": str(event)}
            
            # If no events were received
            return {"success": False, "error": "No response from coordinator agent"}
            
    except httpx.TimeoutException as e:
        logger.error(f"Timeout connecting to coordinator agent: {e}")
        return {"success": False, "error": "Request timeout - coordinator agent took too long to respond"}
    
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error from coordinator agent: {e}")
        return {"success": False, "error": f"HTTP error: {e.response.status_code}"}
    
    except Exception as e:
        logger.error(f"Unexpected error communicating with coordinator: {e}", exc_info=True)
        return {"success": False, "error": f"Internal error: {str(e)}"}


def handler(event, context):
    """
    Lambda handler for coordinator agent communication.
    
    Expects event body with:
        {
            "message": "user message to send to coordinator"
        }
    
    Returns:
        {
            "statusCode": 200,
            "body": JSON string with agent response
        }
    """
    logger.info(f"Received event: {json.dumps(event)}")
    
    # Get environment variables
    runtime_url = os.environ.get('COORDINATOR_AGENT_URL')
    bearer_token = os.environ.get('BEARER_TOKEN')
    
    if not runtime_url:
        logger.error("COORDINATOR_AGENT_URL environment variable not set")
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "Coordinator agent URL not configured"}),
        }
    
    if not bearer_token:
        logger.error("BEARER_TOKEN environment variable not set")
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "Authentication token not configured"}),
        }
    
    # Parse request body
    try:
        if isinstance(event.get('body'), str):
            body = json.loads(event['body'])
        else:
            body = event.get('body', {})
        
        message = body.get('message')
        
        if not message:
            return {
                "statusCode": 400,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"error": "Missing 'message' in request body"}),
            }
        
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in request body: {e}")
        return {
            "statusCode": 400,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": "Invalid JSON in request body"}),
        }
    
    # Send to coordinator agent (run async function)
    result = asyncio.run(send_to_coordinator(message, runtime_url, bearer_token))
    
    if result["success"]:
        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({
                "message": "Success",
                "agent_response": result["response"]
            }),
        }
    else:
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({
                "error": result.get("error", "Unknown error"),
            }),
        }
