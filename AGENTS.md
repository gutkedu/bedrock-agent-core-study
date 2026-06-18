# Project Agent Harness

Project-local skills live in `.codex/skills/`.

Use relevant Superpowers skills before changing behavior or code. In particular:
- Use `using-superpowers` at the start of work.
- Use `brainstorming` before creative feature or behavior design.
- Use `test-driven-development` for implementation changes unless the user explicitly scopes the work to documentation or configuration only.
- Use `writing-plans` when turning a validated spec into an implementation plan.
- Use `verification-before-completion` before claiming work is complete.

Use the project skill at `.codex/skills/sam` when touching AWS SAM templates, nested applications, `samconfig.toml`, Lambda local testing, `sam validate`, `sam build`, `sam local`, `sam sync`, or serverless deployment workflow.

Use the project skill at `.codex/skills/agent-core` when touching Amazon Bedrock AgentCore, Strands Agents, A2A, MCP, runtime deployment, agent invocation, agent cards, authentication/session headers, observability, or files under `agentcore/`.

Project note: the root `README.md` and `agentcore/Makefile` currently reference `src/agents`, but the checked-out tree uses `agentcore/agents`. Verify paths against the filesystem before trusting those docs or targets.
