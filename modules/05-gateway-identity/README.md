# 05 — Gateway e Identity

**Objetivo:** expor uma API/Lambda como tools MCP e controlar quem chama o quê.

Referências: [gateway-identity.md](../../.claude/skills/aws-bedrock-agentcore/references/gateway-identity.md), [security-iam-cost.md](../../.claude/skills/aws-bedrock-agentcore/references/security-iam-cost.md)

## Passos

1. Crie um Gateway com um target (uma Lambda simples ou uma spec OpenAPI).
2. Conecte o agente ao Gateway como cliente MCP.
3. Configure inbound auth (JWT/Cognito ou IAM) no runtime.
4. Use `agentcore add credential` para uma API key de terceiro e consuma via Identity.

## Conceitos para entender

- Inbound auth (quem chama o agente) vs outbound auth (o agente chamando APIs).
- Workload identity e token vault.
- Busca semântica de tools no Gateway.

## Exercícios

1. Invoque o runtime sem token e com token. Compare as respostas.
2. Adicione um segundo target ao Gateway e veja o agente descobrir as novas tools.

## Pronto quando

O agente usa uma tool que mora atrás do Gateway, com autenticação de ponta a ponta.

## Limpeza

Remova gateway, targets, credenciais e a Lambda.
