# 03 — AgentCore Runtime

**Objetivo:** pegar o agente do módulo 02 e hospedá-lo no AgentCore Runtime.

Referências: [agentcore-runtime.md](../../.claude/skills/aws-bedrock-agentcore/references/agentcore-runtime.md), [frameworks-on-agentcore.md](../../.claude/skills/aws-bedrock-agentcore/references/frameworks-on-agentcore.md)

## Passos

1. Crie um projeto com o CLI dentro desta pasta:
   ```bash
   agentcore create --name StudyAgent --framework Strands --protocol HTTP \
     --model-provider Bedrock --memory none --build CodeZip
   ```
2. Leia o código gerado. Ache o `BedrockAgentCoreApp` e o `@app.entrypoint`.
3. Traga suas tools do módulo 02 para dentro dele.
4. `agentcore dev` → teste local na porta 8080 (`/invocations` e `/ping`).
5. `agentcore deploy --plan` (só olhar), depois `agentcore deploy`.
6. `agentcore invoke "..."`, depois com `--session-id` e `--stream`.

## Conceitos para entender

- Contrato HTTP: `POST /invocations`, `GET /ping`, porta 8080, ARM64.
- Sessão = microVM isolada. Idle timeout (15 min), vida máxima (8 h). O que acontece com o estado em memória quando a sessão para?
- Versões e endpoints (`DEFAULT`).
- CodeZip vs container.

## Exercícios

1. Invoque duas vezes com o mesmo `--session-id` e depois com outro. Explique a diferença.
2. Transforme o entrypoint em async generator e faça streaming.
3. Invoque o runtime via boto3 (`bedrock-agentcore` → `invoke_agent_runtime`) num script seu.

## Pronto quando

Seu agente com tools responde de um script Python seu, chamando o runtime na AWS.

## Limpeza

`agentcore remove all && agentcore deploy`
