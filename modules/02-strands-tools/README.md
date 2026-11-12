# 02 — Tools

**Objetivo:** dar capacidades ao agente e ver como o modelo decide chamá-las.

Referências: [strands.md](../../.claude/skills/aws-bedrock-agentcore/references/strands.md), [tools.md](../../.claude/skills/aws-bedrock-agentcore/references/tools.md)

## Passos

1. `calculator_agent.py`: escreva uma tool com `@tool` (ex.: operações aritméticas). A docstring e os type hints viram o schema — capriche neles.
2. Adicione tools prontas de `strands_tools` (`http_request`, `current_time`).
3. `weather_agent.py`: recrie o agente de clima da v1 usando `http_request` contra `api.weather.gov`.
4. Conecte um servidor MCP com `MCPClient` (ex.: um servidor stdio simples) e use as tools dele.

## Conceitos para entender

- Como o schema da tool é gerado e enviado ao modelo.
- Tool que lança exceção: o que o agente recebe e como reage.
- Hooks (`BeforeToolCallEvent`, `AfterToolCallEvent`) para log/validação.

## Exercícios

1. Faça uma tool falhar de propósito e veja o agente se recuperar.
2. Escreva um hook que imprime nome e argumentos de cada chamada de tool.
3. Teste a tool isoladamente com pytest (ela é só uma função).

## Pronto quando

O agente resolve uma pergunta que exige duas tools em sequência, e você vê isso no log do hook.
