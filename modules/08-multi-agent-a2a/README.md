# 08 — Multi-agente e A2A

**Objetivo:** compor agentes — primeiro no mesmo processo, depois entre runtimes via A2A.

Referência: [multi-agent.md](../../.claude/skills/aws-bedrock-agentcore/references/multi-agent.md)

## Passos

1. *Agents as tools*: um orquestrador que chama o agente de clima e o de calculadora (módulo 02) como tools.
2. Swarm ou Graph do Strands para o mesmo problema. Compare.
3. Faça deploy da calculadora como runtime **A2A** (`--protocol A2A`).
4. Busque o *agent card* e chame a calculadora remota a partir do orquestrador.

## Conceitos para entender

- Quando multi-agente ajuda e quando só adiciona latência e custo.
- Agent card, protocolo A2A e como a auth funciona entre runtimes.

## Exercícios

1. Meça tokens e latência: agente único com todas as tools vs orquestrador + especialistas.
2. Derrube o agente remoto e veja como o orquestrador lida com a falha.

## Pronto quando

O orquestrador resolve uma pergunta usando um agente que roda em outro runtime.

## Limpeza

`agentcore remove all && agentcore deploy` em cada projeto.
