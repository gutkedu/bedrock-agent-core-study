# 01 — Strands basics

**Objetivo:** entender o loop do agente (modelo → tool → modelo → resposta) rodando tudo local.

Referência: [strands.md](../../.claude/skills/aws-bedrock-agentcore/references/strands.md)

## Passos

1. `hello_agent.py`: crie um `Agent` com `BedrockModel(model_id=os.environ["BEDROCK_MODEL_ID"])` e um `system_prompt`. Chame `agent("...")` e imprima o resultado.
2. Inspecione o retorno: `result.message`, `result.stop_reason`, `result.metrics` (tokens, latência).
3. Chame o agente duas vezes seguidas. Ele lembra da primeira pergunta? Olhe `agent.messages`.
4. `chat.py`: um REPL simples (`while True: input()`) para conversar.

## Conceitos para entender

- O que é o *event loop* do Strands e quando ele para (`stop_reason`).
- Onde fica o histórico (`agent.messages`) e o *conversation manager* (janela deslizante vs sumarização).
- Streaming: `agent.stream_async` vs chamada síncrona.

## Exercícios

1. Troque o conversation manager por `SlidingWindowConversationManager(window_size=4)` e veja o agente "esquecer".
2. Faça o REPL usar streaming e imprimir token a token.
3. Ajuste `temperature` e `max_tokens` e observe o efeito.

## Pronto quando

Você consegue explicar, sem olhar, o que acontece entre `agent("oi")` e o texto aparecer.
