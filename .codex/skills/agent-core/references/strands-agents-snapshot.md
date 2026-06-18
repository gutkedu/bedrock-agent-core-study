# Strands Agents Snapshot

Snapshot date: 2026-06-16.

Use this as a concise local guide. Check the linked Strands documentation when exact APIs, examples, or release-sensitive behavior matters.

## Sources

| Topic | Source |
|---|---|
| Operating agents in production | https://strandsagents.com/docs/user-guide/deploy/operating-agents-in-production/ |
| Python deployment to AgentCore Runtime | https://strandsagents.com/docs/user-guide/deploy/deploy_to_bedrock_agentcore/python/ |
| Agent-to-Agent protocol | https://strandsagents.com/docs/user-guide/concepts/multi-agent/agent-to-agent/ |
| Build with AI and docs MCP | https://strandsagents.com/docs/user-guide/build-with-ai/ |

## Practices

- Initialize production agents with explicit model configuration instead of relying on defaults.
- Control tool availability carefully in production; expose only the tools required for the agent's purpose.
- Keep specialized agents focused with clear names, descriptions, and system prompts.
- Handle errors deliberately: log failures, return appropriate fallback responses, and preserve enough context for diagnosis.
- Consider streaming for interactive applications when lower perceived latency matters.
- Monitor tool execution time, tool error rates, token usage, response times, and agent error rates.
- Use OpenTelemetry and CloudWatch-oriented observability when running on AWS production paths.
- Strands A2A can expose a Strands agent as an A2A server and can wrap remote A2A agents as tools in supported multi-agent patterns.
- For A2A server isolation, prefer an agent factory per context when the application needs per-caller state separation.
- The Strands docs provide an MCP server and llms.txt sources for coding assistants; use current docs for APIs instead of relying on memory.

## Review Checklist

- Make model id, temperature, max tokens, and top-p choices explicit for production.
- Ensure tool descriptions and specialized agent prompts match the agent's scope.
- Check whether a single agent instance, per-context factory, or external session store is appropriate.
- Confirm local tests cover response extraction and tool use, then list cloud validation still needed.
- Include observability setup for production-grade work.
