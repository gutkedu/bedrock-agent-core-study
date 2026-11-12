# Bedrock AgentCore Study

Trilha prática para aprender **Strands Agents** (o SDK de agentes) e **Amazon Bedrock AgentCore** (a plataforma que hospeda e opera agentes na AWS).

A ideia: cada módulo introduz **um** conceito, você escreve o código, roda, e só passa para o próximo quando o critério de "pronto" do módulo estiver cumprido.

> A versão anterior deste repo (backend serverless + SAM/CDK do hackathon) está preservada na tag `archive/v1` (main antigo) e na branch `feat/cdk-iac-migration` (migração para CDK).

## Trilha

| # | Módulo | Você aprende | Roda onde |
|---|--------|--------------|-----------|
| 00 | [setup](modules/00-setup/) | uv, credenciais AWS, acesso a modelo no Bedrock | local |
| 01 | [strands-basics](modules/01-strands-basics/) | `Agent`, `BedrockModel`, o loop do agente, conversa | local |
| 02 | [strands-tools](modules/02-strands-tools/) | `@tool`, `strands-agents-tools`, tools via MCP | local |
| 03 | [runtime](modules/03-runtime/) | `BedrockAgentCoreApp`, `agentcore dev/deploy/invoke`, sessões, streaming | AWS |
| 04 | [memory](modules/04-memory/) | memória de curto e longo prazo do AgentCore | AWS |
| 05 | [gateway-identity](modules/05-gateway-identity/) | Gateway (APIs → MCP), Identity, credenciais OAuth/API key | AWS |
| 06 | [builtin-tools](modules/06-builtin-tools/) | Code Interpreter e Browser gerenciados | AWS |
| 07 | [observability](modules/07-observability/) | logs, traces OTel, CloudWatch GenAI | AWS |
| 08 | [multi-agent-a2a](modules/08-multi-agent-a2a/) | agents-as-tools, Swarm/Graph, protocolo A2A | AWS |
| 09 | [iac-cdk](modules/09-iac-cdk/) | o que o CLI gera vs CDK escrito à mão | AWS |

Os módulos 00–02 não custam nada além de tokens do Bedrock. A partir do 03 há recursos na conta — cada módulo termina com a seção **Limpeza**.

## Começando

```bash
# 1. ferramentas
curl -LsSf https://astral.sh/uv/install.sh | sh     # uv
npm install -g @aws/agentcore                        # AgentCore CLI (Node 20+)

# 2. dependências Python
uv sync

# 3. ambiente
cp .env.example .env      # ajuste AWS_PROFILE / AWS_REGION / BEDROCK_MODEL_ID
uv run modules/00-setup/check_env.py
```

Depois siga [modules/00-setup](modules/00-setup/).

## Progresso

Marque em [PROGRESS.md](PROGRESS.md) ao terminar cada módulo, com uma linha do que aprendeu.

## Material de referência

[`.claude/skills/aws-bedrock-agentcore/references/`](.claude/skills/aws-bedrock-agentcore/references/) tem um resumo com fontes oficiais (snapshot de junho/2026) de cada serviço. Cada módulo aponta para o arquivo relevante. As APIs mudam rápido: na dúvida, confira o link oficial citado no próprio arquivo.

## Layout

```text
modules/NN-nome/
├── README.md      conceito, passos, exercícios, critério de pronto, limpeza
├── *.py           o código que você escreve
└── tests/         testes locais (quando fizer sentido)
```
