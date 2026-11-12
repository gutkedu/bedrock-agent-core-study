# 04 — Memory

**Objetivo:** o agente lembrar do usuário entre sessões.

Referência: [memory.md](../../.claude/skills/aws-bedrock-agentcore/references/memory.md)

## Passos

1. `agentcore add memory --name StudyMemory --strategies SEMANTIC` e redeploy.
2. Ligue a memória ao agente (session manager do Strands para AgentCore Memory).
3. Teste: conte algo numa sessão, pergunte em outra sessão.

## Conceitos para entender

- Memória de curto prazo (eventos da sessão) vs longo prazo (registros extraídos por estratégia).
- Estratégias: semantic, summary, user preference.
- `actorId` vs `sessionId`.
- A extração de longo prazo é **assíncrona** — não aparece na hora.

## Exercícios

1. Liste os registros de longo prazo via boto3 e veja o que foi extraído.
2. Use dois `actorId` diferentes e confirme que um não vê a memória do outro.

## Pronto quando

O agente responde "você me disse que..." numa sessão nova.

## Limpeza

Remova a memória com o CLI e faça redeploy.
