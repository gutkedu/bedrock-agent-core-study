# 00 — Setup

**Objetivo:** ter credenciais, região e um modelo do Bedrock respondendo pelo terminal.

## Passos

1. Instale `uv` e rode `uv sync` na raiz.
2. Configure um perfil AWS só para estudo (`aws configure sso` ou `aws login`). Use uma conta de sandbox se tiver.
3. Escolha a região (`us-east-1` ou `us-west-2` têm todos os recursos do AgentCore, inclusive previews).
4. Descubra os inference profiles disponíveis:
   ```bash
   aws bedrock list-inference-profiles --query "inferenceProfileSummaries[].inferenceProfileId"
   ```
5. `cp .env.example .env`, preencha e rode `uv run modules/00-setup/check_env.py`.

## Conceitos para entender

- **Model ID vs inference profile** (`us.`/`global.` na frente): o profile roteia entre regiões. Ver [bedrock.md](../../.claude/skills/aws-bedrock-agentcore/references/bedrock.md).
- **Converse API**: a API unificada que o Strands usa por baixo.
- Ordem de resolução da região no boto3 (env > profile > default).

## Exercícios

1. Troque o `BEDROCK_MODEL_ID` por um modelo menor e compare a latência.
2. Force um erro (model ID inválido) e leia a mensagem. Qual é o código de erro?

## Pronto quando

`check_env.py` imprime "Tudo certo".
