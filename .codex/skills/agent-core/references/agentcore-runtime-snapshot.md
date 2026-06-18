# AgentCore Runtime Snapshot

Snapshot date: 2026-06-16.

Use this as a concise local guide. Check the linked AWS documentation when exact CLI flags, service behavior, or release-sensitive behavior matters.

## Sources

| Topic | Source |
|---|---|
| AgentCore overview | https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html |
| AgentCore Runtime | https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/agents-tools-runtime.html |
| AgentCore CLI | https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-get-started-cli.html |
| A2A on AgentCore Runtime | https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-a2a.html |

## Practices

- AgentCore is for building, deploying, and operating agents securely at scale while keeping framework and model choice flexible.
- Runtime supports common agent frameworks such as Strands and also custom agents.
- Runtime supports agent/tool communication through protocols such as A2A and MCP.
- Each user session is isolated in dedicated runtime resources. Design code and storage assumptions around per-session isolation.
- Runtime can support long-running work; align client timeouts, Lambda timeouts, and user-facing expectations accordingly.
- Current AWS docs use the npm-distributed AgentCore CLI: `npm install -g @aws/agentcore`, then `agentcore --help`.
- For Python SDK integration, an AgentCore app wraps an entrypoint function and runs a local HTTP service for `/invocations`.
- For deployed invocation through AWS SDK, `invoke_agent_runtime` requires an agent runtime ARN, runtime session ID, payload, and qualifier.
- For OAuth-integrated runtime invocation, AWS docs call out HTTPS invocation instead of the SDK path.

## A2A Runtime Notes

- A2A work starts with a local A2A server, local test, deploy to Runtime, fetch agent card, then invoke deployed server.
- A2A clients should discover the agent card from the runtime base URL before sending messages.
- Runtime A2A calls use bearer authorization and `X-Amzn-Bedrock-AgentCore-Runtime-Session-Id`.
- Generate a fresh session ID for a logical conversation/session unless intentionally resuming supported state.
- Use non-streaming or streaming clients intentionally and reflect that in timeouts and response handling.

## Review Checklist

- Identify runtime type and protocol before changing code.
- Verify CLI assumptions against current AWS docs, especially if a repository uses older `agentcore` tooling.
- Check auth headers, session ID propagation, and agent card discovery for A2A paths.
- Call out local-only coverage versus required AWS validation.
- Include cleanup guidance for created runtime resources when relevant.
