#!/usr/bin/env python3
"""
Simple A2A client runner script.

This script mirrors the basic flow used in `my_a2a_client_remote.py` but is
intended as a compact runnable example. Set `BEARER_TOKEN` and
`AGENTCORE_RUNTIME_URL` manually in this file (or via the respective
environment variables) before running.

Install dependencies for the script with:
    pip install -r requirements.txt
from this directory (or the repository top-level if you prefer).

Usage:
  python run_a2a_client.py --message "hello"

Note: This script expects the same Python a2a package used in
`my_a2a_client_remote.py` to be available in the environment.
See `requirements.txt` in this folder for the minimal packages required.
"""
import argparse
import asyncio
import logging
import os
from uuid import uuid4

import httpx
from a2a.client import A2ACardResolver, ClientConfig, ClientFactory
from a2a.types import Message, Part, Role, TextPart

DEFAULT_TIMEOUT = 300  # 5 minutes

# Placeholders — fill these values directly in the file, or override them via
# environment variables prior to running this script.
BEARER_TOKEN = "ENTER_BEARER_TOKEN_HERE"
AGENTCORE_RUNTIME_URL = "http://127.0.0.1:9000"

logging.basicConfig(level=logging.WARNING)
logger = logging.getLogger(__name__)


def create_message(*, role: Role = Role.user, text: str) -> Message:
    return Message(
        kind="message",
        role=role,
        parts=[Part(TextPart(kind="text", text=text))],
        message_id=uuid4().hex,
    )


async def send_sync_message(message: str, *, runtime_url: str, bearer_token: str):
    """Send a synchronous (non-streaming) message to the runtime and return the text reply.

    Args:
      message: The human text to send.
      runtime_url: Base runtime URL for the Bedrock AgentCore runtime.
      bearer_token: Authorization bearer token.
    Returns:
      A string containing the agent response or an informative error.
    """
    session_id = str(uuid4())

    # Use passed-in values but allow environment override
    runtime_url = os.environ.get("AGENTCORE_RUNTIME_URL", runtime_url)
    bearer_token = os.environ.get("BEARER_TOKEN", bearer_token)

    headers = {
        "Authorization": f"Bearer {bearer_token}",
        "X-Amzn-Bedrock-AgentCore-Runtime-Session-Id": session_id,
    }

    async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT, headers=headers) as httpx_client:
        resolver = A2ACardResolver(httpx_client=httpx_client, base_url=runtime_url)
        agent_card = await resolver.get_agent_card()

        # Build client using the factory and card
        config = ClientConfig(httpx_client=httpx_client, streaming=False)
        factory = ClientFactory(config)
        client = factory.create(agent_card)

        msg = create_message(text=message)

        async for event in client.send_message(msg):
            if isinstance(event, Message):
                text_parts = [part.text for part in event.parts if isinstance(part, TextPart)]
                final_result = " ".join(text_parts) if text_parts else "No text content found"
                return final_result
            elif isinstance(event, tuple) and len(event) == 2:
                task, update_event = event
                if hasattr(task, "artifacts") and task.artifacts:
                    for artifact in task.artifacts:
                        if hasattr(artifact, "parts") and artifact.parts:
                            for part in artifact.parts:
                                if hasattr(part, "root") and isinstance(part.root, TextPart):
                                    text_content = part.root.text
                                    return text_content
            else:
                return str(event)


async def main():
    parser = argparse.ArgumentParser(description="Run a small a2a message from the command line")
    parser.add_argument("-m", "--message", help="Message text to send", default="what is the cosine of pi divided by 4 plus the square root of 16?")
    parser.add_argument("--url", help="Runtime base URL (overrides hard-coded value)", default=AGENTCORE_RUNTIME_URL)
    parser.add_argument("--token", help="Bearer token (overrides hard-coded value)", default=BEARER_TOKEN)
    args = parser.parse_args()

    result = await send_sync_message(args.message, runtime_url=args.url, bearer_token=args.token)
    print("Agent response:\n", result)


if __name__ == "__main__":
    asyncio.run(main())
