
import asyncio
import logging
import os
from uuid import uuid4

import httpx
from a2a.client import A2ACardResolver, ClientConfig, ClientFactory
from a2a.types import Message, Part, Role, TextPart

logging.basicConfig(level=logging.WARNING)  # Reduce logging to show only warnings and errors
logger = logging.getLogger(__name__)

DEFAULT_TIMEOUT = 300  # set request timeout to 5 minutes

def create_message(*, role: Role = Role.user, text: str) -> Message:
    return Message(
        kind="message",
        role=role,
        parts=[Part(TextPart(kind="text", text=text))],
        message_id=uuid4().hex,
    )

async def send_sync_message(message: str):
    # Get runtime URL from environment variable
    runtime_url = os.environ.get('AGENTCORE_RUNTIME_URL', 'http://127.0.0.1:9000/')
    
    # Generate a unique session ID
    session_id = str(uuid4())

    # Add authentication headers for Amazon Bedrock AgentCore
    headers = {"Authorization": f"Bearer {os.environ.get('BEARER_TOKEN')}",
        'X-Amzn-Bedrock-AgentCore-Runtime-Session-Id': session_id}
        
    async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT, headers=headers) as httpx_client:
        # Get agent card from the runtime URL
        resolver = A2ACardResolver(httpx_client=httpx_client, base_url=runtime_url)
        agent_card = await resolver.get_agent_card()

        # Agent card contains the correct URL (same as runtime_url in this case)
        # No manual override needed - this is the path-based mounting pattern

        # Create client using factory
        config = ClientConfig(
            httpx_client=httpx_client,
            streaming=False,  # Use non-streaming mode for sync response
        )
        factory = ClientFactory(config)
        client = factory.create(agent_card)

        # Create and send message
        msg = create_message(text=message)

        # With streaming=False, this will yield exactly one result
        async for event in client.send_message(msg):
            print(f"Event type: {type(event)}")
            if isinstance(event, Message):
                # Extract text from the message
                text_parts = [part.text for part in event.parts if isinstance(part, TextPart)]
                final_result = " ".join(text_parts) if text_parts else "No text content found"
                return final_result
            elif isinstance(event, tuple) and len(event) == 2:
                # (Task, UpdateEvent) tuple
                task, update_event = event
                
                # Extract text from Task artifacts (where the final result is stored)
                if hasattr(task, 'artifacts') and task.artifacts:
                    for artifact in task.artifacts:
                        if hasattr(artifact, 'parts') and artifact.parts:
                            for part in artifact.parts:
                                if hasattr(part, 'root') and isinstance(part.root, TextPart):
                                    text_content = part.root.text
                                    # Return the full response including reasoning
                                    print("Agent Response:")
                                    print(text_content)
                                    return text_content
            else:
                # Fallback for other response types
                return str(event)

# Usage - Uses AGENTCORE_RUNTIME_URL environment variable
result = asyncio.run(send_sync_message("what is 101 * 11"))
print(result)
    