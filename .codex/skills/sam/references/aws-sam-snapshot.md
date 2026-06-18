# AWS SAM Snapshot

Snapshot date: 2026-06-16.

Use this as a concise local guide. Check the linked AWS documentation when exact options, new runtime support, or release-sensitive behavior matters.

## Sources

| Topic | Source |
|---|---|
| `sam build` | https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-build.html |
| `sam validate --lint` | https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-validate.html |
| `sam local invoke` | https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-local-invoke.html |
| `sam local start-api` | https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-local-start-api.html |
| `samconfig.toml` | https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-config.html |
| `sam sync` | https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/using-sam-cli-sync.html |

## Practices

- `sam validate` checks whether a SAM template is valid; add `--lint` to run CloudFormation linter rules through SAM.
- `sam build` prepares function and layer artifacts for `sam local` and `sam deploy` under `.aws-sam`. Do not edit generated files in `.aws-sam/build`.
- If `.aws-sam` exists, local commands may use built artifacts. Re-run `sam build` after source, dependency, or template changes.
- `sam local invoke` is best for one function and one event. Use `--event` for custom payloads and `--env-vars` for local environment files.
- For nested applications, invoke with `StackLogicalId/FunctionLogicalId`.
- `sam local start-api` is best for API Gateway flows. Use it to exercise routes and Lambda authorizers locally, but do not treat local auth as production-equivalent.
- Local testing does not validate every cloud behavior, especially IAM permissions, service integrations, and deployed authorizers.
- `sam sync` accelerates development cloud testing and is intended for development stacks. Use `sam deploy` or CI/CD for production.
- In `samconfig.toml`, command sections use command names with spaces and hyphens replaced by underscores, such as `local_invoke` and `local_start_api`.

## Review Checklist

- Identify the template root and any nested `AWS::Serverless::Application` boundaries.
- Validate every changed template with `sam validate --lint -t <template>`.
- Build before local invocation when code, dependencies, layers, or build metadata changed.
- Keep secrets out of committed `samconfig.toml`; prefer parameters, environment-specific config, or secure stores.
- Call out any behavior that still needs cloud validation.
