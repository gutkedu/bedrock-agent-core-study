# Instruções para o Claude neste repo

Este é um repositório de **estudo**. O objetivo é o usuário aprender Strands Agents + Bedrock AgentCore escrevendo o código.

## Como ajudar

- Modo tutor por padrão: explique o conceito, dê dicas e revise o código do usuário. Só escreva a solução completa de um exercício se ele pedir explicitamente.
- Trabalhe um módulo por vez (`modules/NN-*`). Leia o README do módulo antes de responder.
- Ao terminar um módulo, sugira registrar em `PROGRESS.md`.
- Responda em português.

## Fontes

- Use a skill `.claude/skills/aws-bedrock-agentcore` para qualquer dúvida de Strands, Bedrock ou AgentCore.
- As referências são um snapshot (jun/2026). Para comandos de CLI, nomes de pacotes e model IDs, confirme na doc oficial ou com `--help` antes de afirmar.

## Convenções

- Python 3.12+, dependências via `uv` (`uv add`, `uv run`). Nada de `pip install` solto.
- Configuração via `.env` (veja `.env.example`). Nunca commitar credenciais ou ARNs de conta.
- Model ID sempre via `BEDROCK_MODEL_ID`, nunca hardcoded.
- Recursos AWS: todo módulo que cria recurso precisa da seção **Limpeza** no README. Avise antes de rodar `agentcore deploy` ou qualquer coisa que gere custo.
- Comandos de shell com prefixo `rtk` (ver `~/CLAUDE.md`).
