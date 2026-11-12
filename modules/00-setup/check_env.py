"""Verifica se o ambiente está pronto: credenciais AWS, região e acesso ao modelo.

Uso: uv run modules/00-setup/check_env.py
"""

import os
import sys

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from dotenv import load_dotenv

load_dotenv()


def ok(msg: str) -> None:
    print(f"  [ok]   {msg}")


def fail(msg: str, hint: str) -> None:
    print(f"  [erro] {msg}\n         -> {hint}")
    sys.exit(1)


def main() -> None:
    region = os.getenv("AWS_REGION")
    model_id = os.getenv("BEDROCK_MODEL_ID")
    if not region or not model_id:
        fail("AWS_REGION ou BEDROCK_MODEL_ID ausente", "copie .env.example para .env e preencha")

    session = boto3.Session(region_name=region)

    print("1. Credenciais")
    try:
        ident = session.client("sts").get_caller_identity()
        ok(f"conta ...{ident['Account'][-4:]} | {ident['Arn'].split(':')[-1]}")
    except (BotoCoreError, ClientError) as e:
        fail(f"sem credenciais válidas ({e})", "rode `aws configure sso` ou `aws login`")

    print("2. Modelo no Bedrock")
    try:
        resp = session.client("bedrock-runtime").converse(
            modelId=model_id,
            messages=[{"role": "user", "content": [{"text": "Responda só: pong"}]}],
            inferenceConfig={"maxTokens": 10},
        )
        text = resp["output"]["message"]["content"][0]["text"]
        ok(f"{model_id} respondeu: {text.strip()!r}")
    except ClientError as e:
        code = e.response["Error"]["Code"]
        fail(
            f"{code}: {e.response['Error']['Message']}",
            "confira o model ID com `aws bedrock list-inference-profiles` e o acesso ao modelo no console",
        )

    print("\nTudo certo. Siga para modules/01-strands-basics.")


if __name__ == "__main__":
    main()
