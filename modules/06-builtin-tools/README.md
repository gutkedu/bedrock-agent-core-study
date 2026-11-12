# 06 — Built-in tools

**Objetivo:** usar o Code Interpreter e o Browser gerenciados.

Referência: [agentcore-tools.md](../../.claude/skills/aws-bedrock-agentcore/references/agentcore-tools.md)

## Passos

1. Dê ao agente o Code Interpreter e peça uma análise de um CSV pequeno.
2. Dê ao agente o Browser e peça para extrair algo de uma página pública.

## Conceitos para entender

- Sessões de sandbox: duração, isolamento, arquivos.
- Quando usar Code Interpreter em vez de uma tool Python sua.

## Exercícios

1. Peça um gráfico ao Code Interpreter e recupere o arquivo gerado.
2. Compare custo e latência entre Browser e `http_request` para a mesma tarefa.

## Pronto quando

O agente responde uma pergunta que exige rodar código de verdade.

## Limpeza

Encerre sessões abertas; remova recursos criados.
