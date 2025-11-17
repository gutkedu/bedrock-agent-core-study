#!/usr/bin/env python3
"""
Simple script to fetch an agent card from an AgentCore runtime using string literals.

This mirrors the version under `agents/calculator_agent_a2a/fetch_agent_card.py` but
uses string constants (and optional CLI overrides) instead of environment variables.

Dependencies:
  pip install -r requirements.txt

Usage:
  python fetch_agent_card.py

Optionally you can override the defaults via CLI flags:
  python fetch_agent_card.py --agent-arn "arn:..." --token "TOKEN" --region us-east-1
"""
import argparse
import json
import requests
from uuid import uuid4
from urllib.parse import quote

# Defaults — change these values directly, or pass via command line
AGENT_ARN = "ENTER_AGENT_ARN_HERE"
BEARER_TOKEN = "ENTER_BEARER_TOKEN_HERE"
REGION = "us-east-1"


def fetch_agent_card(*, agent_arn: str, bearer_token: str, region: str = "us-east-1"):
    """Fetch and print the agent card for the given agent ARN.

    This function intentionally avoids reading from environment variables.
    """
    if not agent_arn:
        print("Error: agent ARN string is empty; set AGENT_ARN in the script or pass --agent-arn")
        return None

    if not bearer_token:
        print("Error: bearer token string is empty; set BEARER_TOKEN in the script or pass --token")
        return None

    escaped_agent_arn = quote(agent_arn, safe="")
    url = f"https://bedrock-agentcore.{region}.amazonaws.com/runtimes/{escaped_agent_arn}/invocations/.well-known/agent-card.json"

    session_id = str(uuid4())
    print(f"Generated session ID: {session_id}")

    headers = {
        "Accept": "*/*",
        "Authorization": f"Bearer {bearer_token}",
        "X-Amzn-Bedrock-AgentCore-Runtime-Session-Id": session_id,
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        agent_card = response.json()
        print(json.dumps(agent_card, indent=2))
        return agent_card
    except requests.exceptions.RequestException as e:
        print(f"Error fetching agent card: {e}")
        return None


def main():
    parser = argparse.ArgumentParser(description="Fetch an agent card from an AgentCore runtime (uses string constants by default)")
    parser.add_argument("--agent-arn", help="Agent ARN (overrides embedded AGENT_ARN string)", default=AGENT_ARN)
    parser.add_argument("--token", help="Bearer token (overrides embedded BEARER_TOKEN string)", default=BEARER_TOKEN)
    parser.add_argument("--region", help="AWS region (overrides embedded REGION)", default=REGION)
    args = parser.parse_args()

    fetch_agent_card(agent_arn=args.agent_arn, bearer_token=args.token, region=args.region)


if __name__ == "__main__":
    main()
