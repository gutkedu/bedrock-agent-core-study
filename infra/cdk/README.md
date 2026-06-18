# CDK Infrastructure

This directory is the active IaC entrypoint for the project. It migrates the
existing SAM/serverless infrastructure and the AgentCore runtime deployment into
one AWS CDK TypeScript app.

The old SAM templates under `infra/stateful`, `infra/stateless`,
`backend/nodejs/template.yaml`, and `backend/python/template.yaml` remain in the
repository as legacy reference material until a CDK deploy has been validated.

## Stacks

- `StatefulStack`: Cognito User Pool, User Pool Client, Identity Pool, and the
  legacy CloudFormation exports consumed by the backend.
- `BackendStack`: Node.js auth Lambdas, Python hello/coordinator Lambdas, API
  Gateway routes, CORS, and the token authorizer resource.
- `AgentCoreStack`: Docker-asset deployments for `weather_agent` as HTTP and
  `calculator_agent_a2a` as A2A, using the CDK AgentCore L2 construct.

## Commands

Install dependencies:

```bash
npm install
```

Run the CDK tests:

```bash
npm test
```

Type-check:

```bash
npm run build
```

Synthesize all stacks:

```bash
npm run synth
```

Review changes before deploy:

```bash
npm run diff
```

Deploy all stacks:

```bash
npm run deploy
```

## Context

Default context values are defined in `lib/config.ts` and can be overridden:

```bash
npx cdk synth \
  -c appName=ServerlessHackaton \
  -c envName=dev \
  -c region=us-east-1 \
  -c coordinatorAgentUrl="https://example.runtime/invocations" \
  -c bearerToken=""
```

`CoordinatorAgentUrl` and `BearerToken` are still CloudFormation parameters in
`BackendStack`. This preserves the current Lambda coordinator contract while the
AgentCore auth model is validated in AWS.

## Local Bundling Notes

The backend Node.js Lambdas bundle locally from `backend/nodejs`, so that
directory has its own `package-lock.json`.

The Node dependency layer and Python coordinator Lambda use Docker bundling. The
default bundling platform is `linux/amd64` because this development machine does
not have ARM64 emulation configured. The deployed Lambda architecture is still
`arm64`. If your Docker host supports ARM64 builds, override the bundling
platform:

```bash
CDK_BUNDLE_PLATFORM=linux/arm64 npm run synth
```

The AgentCore runtimes use Docker image assets with `linux/arm64`, matching the
AgentCore runtime contract.

## Deployment Caution

This CDK app preserves legacy export names such as `StatefulStack-UserPoolId`.
Do not deploy it into the same account/region while the SAM stacks exporting the
same names are still active unless you first change the stack/export naming
strategy.
