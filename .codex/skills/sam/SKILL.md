---
name: sam
description: Use when working with AWS SAM templates, samconfig.toml, nested serverless applications, Lambda local testing, sam validate, sam build, sam local, sam sync, or SAM deployment workflow.
---

# SAM

## Overview

Use this skill to plan and verify AWS Serverless Application Model changes with current SAM CLI habits and this local documentation snapshot.

Before changing templates or deployment workflow, read `references/aws-sam-snapshot.md`.

## Workflow

1. Inspect the template boundary first: root stack, nested application, function template, layer, and matching `samconfig.toml`.
2. Validate template shape with `sam validate --lint -t <template>`.
3. Build before local runtime checks with `sam build -t <template>` when code or dependency artifacts matter.
4. Use `sam local invoke` for one Lambda event and `sam local start-api` for API Gateway flows.
5. Treat local tests as fast feedback only; validate IAM, authorizers, integrations, and deployed service permissions in AWS before production.
6. Use `sam sync` only for development stacks; use `sam deploy` or CI/CD for production paths.

## Quick Reference

| Task | Default command |
|---|---|
| Validate template | `sam validate --lint -t template.yaml` |
| Build artifacts | `sam build -t template.yaml` |
| Invoke function | `sam local invoke FunctionLogicalId --event events/event.json -t template.yaml` |
| Invoke nested function | `sam local invoke StackLogicalId/FunctionLogicalId -t template.yaml` |
| Run local API | `sam local start-api -t template.yaml` |
| Sync development stack | `sam sync --watch` |

## Common Mistakes

| Mistake | Fix |
|---|---|
| Editing `.aws-sam/build` | Edit source files and rerun `sam build`. |
| Trusting local authorizer behavior completely | Re-test critical auth behavior in AWS. |
| Running local checks on stale build artifacts | Rebuild after source, dependency, or template changes. |
| Using `sam sync` for production | Use `sam deploy` or CI/CD. |
| Guessing nested logical IDs | Read the parent `AWS::Serverless::Application` and child template outputs first. |
