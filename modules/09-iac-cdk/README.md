# 09 — IaC com CDK

**Objetivo:** entender o que o `agentcore deploy` cria e saber escrever isso à mão.

Referências: [deployment-cdk.md](../../.claude/skills/aws-bedrock-agentcore/references/deployment-cdk.md), [deployment-best-practices.md](../../.claude/skills/aws-bedrock-agentcore/references/deployment-best-practices.md)

## Passos

1. Rode `agentcore deploy --plan` num projeto do módulo 03 e leia o CDK/CloudFormation gerado.
2. Escreva um app CDK TypeScript com o construct L2 `aws-cdk-lib/aws-bedrockagentcore` (`Runtime`) para o mesmo agente.
3. Compare com o stack da v1: `git show feat/cdk-iac-migration:infra/cdk/lib/agent-core-stack.ts`.

## Conceitos para entender

- Execution role: trust policy com proteção de *confused deputy* e permissões mínimas.
- Imagem ARM64 vs CodeZip no CDK.
- Versões, endpoints e como fazer rollout.

## Exercícios

1. Reduza a execution role ao mínimo e confirme que o agente ainda funciona.
2. Adicione um teste de snapshot/assertion do stack.

## Pronto quando

Você sobe o mesmo agente só com `cdk deploy`, sem o CLI.

## Limpeza

`cdk destroy`
