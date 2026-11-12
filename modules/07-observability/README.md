# 07 — Observabilidade

**Objetivo:** enxergar o que o agente fez: cada chamada de modelo, cada tool, tokens e latência.

Referência: [observability.md](../../.claude/skills/aws-bedrock-agentcore/references/observability.md)

## Passos

1. Habilite Transaction Search no CloudWatch (uma vez por conta).
2. `agentcore logs`, `agentcore traces list`, `agentcore traces get <id>`.
3. Abra o painel GenAI Observability no CloudWatch e ache uma invocação sua.
4. Local: exporte traces OTel do Strands para o console.

## Conceitos para entender

- Spans: invocação → ciclo do loop → chamada de modelo → tool.
- Atributos de sessão e como correlacionar com `runtimeSessionId`.

## Exercícios

1. Encontre a invocação mais cara (em tokens) do dia.
2. Adicione um atributo customizado ao span e encontre-o no CloudWatch.

## Pronto quando

Você explica um trace de ponta a ponta, span por span.
