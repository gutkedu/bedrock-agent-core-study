---
name: agent-core
description: Use when working with Amazon Bedrock AgentCore, Strands Agents, A2A, MCP, agent runtime deployment, agent cards, invocation, auth/session headers, observability, or agent production readiness.
---

# AgentCore

## Overview

Use this skill to work on Amazon Bedrock AgentCore and Strands Agents with current runtime, A2A, authentication, and observability guidance.

Read the relevant reference before changing behavior:
- `references/agentcore-runtime-snapshot.md` for AgentCore Runtime, CLI, A2A, invocation, and runtime concepts.
- `references/strands-agents-snapshot.md` for Strands production, A2A server/client, model configuration, observability, and docs access.

## Workflow

1. Confirm the protocol and deployment shape: HTTP runtime app, A2A server, MCP tool, or custom FastAPI service.
2. Prefer current AWS AgentCore CLI guidance for new AgentCore work. The modern CLI is `@aws/agentcore`; older local `agentcore` commands may be stale.
3. For A2A, preserve agent card discovery, bearer authorization, and `X-Amzn-Bedrock-AgentCore-Runtime-Session-Id` handling.
4. Keep session isolation in mind. Do not share user state through globals unless the runtime/session model explicitly supports it.
5. Configure models explicitly for production: model id, temperature, token limits, and tool availability.
6. Add observability expectations for production: logs, traces, metrics, tool error rates, response time, and token usage.
7. Validate locally first, then identify what still requires AWS cloud validation.

## Quick Reference

| Area | Check |
|---|---|
| Runtime | Is this AgentCore Runtime, Lambda, container, or local-only? |
| Protocol | Is the contract HTTP, A2A, MCP, or a custom API? |
| Auth | Are bearer/OAuth/IAM/Cognito assumptions explicit? |
| Session | Is a unique runtime session ID created and propagated? |
| A2A | Can clients resolve the agent card before sending messages? |
| Strands | Are model config, tools, and callback/streaming behavior explicit? |
| Observability | Are logs, traces, metrics, errors, latency, and token usage covered? |

## Common Mistakes

| Mistake | Fix |
|---|---|
| Trusting stale sample paths | Inspect the real tree before using generated Makefiles or README commands. |
| Omitting AgentCore session headers | Generate and pass a unique runtime session ID for runtime calls. |
| Sharing global mutable state across users | Design for per-session isolation or explicit persistence. |
| Treating local A2A as cloud-ready | Re-test auth, URLs, agent card paths, and invocation in AWS. |
| Leaving model defaults implicit | Set production model config deliberately. |
