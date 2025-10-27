# Bedrock AgentCore Multi-Agent Study

A scalable multi-agent project demonstrating agent-to-agent patterns and deployment options using Amazon Bedrock AgentCore and Strands Agents.

## Project Structure

```
bedrock-agent-core-study/
├── agents/                    # Individual agent implementations
│   └── agent1/               # Example agent
│       ├── __init__.py
│       ├── agent.py          # Main agent logic with config variables
│       ├── requirements.txt  # Agent dependencies
│       └── tests/            # Agent tests
├── .bedrock_agentcore.yaml  # AgentCore deployment configuration
├── requirements.txt         # Shared project dependencies
├── Makefile                 # Build and deployment automation
└── README.md
```

## Quick Start

### 1. Setup Environment

```bash
# Create virtual environment and install dependencies
make setup
make install
make install-agentcore
```

### 2. Configure Default Agent

```bash
# Activate virtual environment
source .venv/bin/activate.fish

# Configure the default agent
make configure-agent AGENT=agent1
```

### 3. Deploy Locally

```bash
# Deploy agent1 locally for testing
make deploy-local AGENT=agent1
```

### 4. Test the Agent

```bash
# Test with a simple prompt
make test-endpoint AGENT=agent1 PROMPT="Hello, world!"
```

## Available Make Commands

| Command | Description |
|---------|-------------|
| `make help` | Show all available commands |
| `make setup` | Create virtual environment |
| `make install` | Install all dependencies |
| `make list-agents` | List all available agents |
| `make create-agent AGENT_NAME=new_agent` | Create a new agent |
| `make run-agent AGENT=agent1` | Run agent locally (development) |
| `make test` | Run all agent tests |
| `make test-agent AGENT=agent1` | Run tests for specific agent |
| `make deploy-local AGENT=agent1` | Deploy agent locally |
| `make deploy-aws AGENT=agent1` | Deploy agent to AWS |
| `make clean` | Clean up build artifacts |

## Creating a New Agent

To create a new agent, use the `create-agent` command:

```bash
make create-agent AGENT_NAME=my_new_agent
```

This will:
- Create the directory structure under `agents/my_new_agent/`
- Copy template files from `agent1`
- Create a basic configuration file

Then customize:
- `agents/my_new_agent/agent.py` - Implement your agent logic
- `config/my_new_agent.yaml` - Configure your agent settings
- `agents/my_new_agent/requirements.txt` - Add agent-specific dependencies

## Agent Development

### Agent Structure

Each agent should have:
- `agent.py` - Main entrypoint with `@app.entrypoint` decorator and configuration variables
- `requirements.txt` - Agent dependencies
- `tests/test_agent.py` - Unit tests

### Configuration

Agent configurations are defined as Python variables within each agent's `agent.py`:

```python
# Agent configuration
AGENT_CONFIG = {
    "name": "agent1",
    "version": "1.0.0",
    "description": "Basic conversational agent using Strands",
    "model": "default",
    "max_tokens": 1000,
    "temperature": 0.7,
    "system_prompt": "You are a helpful AI assistant."
}
```

## Deployment Options

### Local Development

For local testing without AWS:

```bash
make run-agent AGENT=agent1
```

This runs the agent directly using the Bedrock AgentCore app.

### Local Container Deployment

Using AgentCore toolkit for containerized local deployment:

```bash
make deploy-local AGENT=agent1
```

### AWS Deployment

Deploy to Amazon Bedrock AgentCore:

```bash
make deploy-aws AGENT=agent1
```

## Testing

### Unit Tests

Run all tests:
```bash
make test
```

Run tests for specific agent:
```bash
make test-agent AGENT=agent1
```

### Integration Testing

Test deployed endpoints:
```bash
make test-endpoint AGENT=agent1 PROMPT="Test message"
```

## Configuration Files

### .bedrock_agentcore.yaml

Main deployment configuration for all agents:

```yaml
default_agent: agent1
agents:
  agent1:
    name: agent1
    entrypoint: agents/agent1/agent.py
    platform: linux/arm64
    # ... AWS configuration
```

### Agent Configuration

Individual agent settings are defined as Python variables within each agent's code. See the agent development section above for examples.

## Development Workflow

1. **Create Agent**: `make create-agent AGENT_NAME=new_agent`
2. **Develop**: Edit `agents/new_agent/agent.py`
3. **Test**: `make test-agent AGENT=new_agent`
4. **Deploy Locally**: `make deploy-local AGENT=new_agent`
5. **Deploy to AWS**: `make deploy-aws AGENT=new_agent`

## Troubleshooting

### Common Issues

- **"agentcore: command not found"**: Ensure virtual environment is activated
- **Port conflicts**: Default port is 8080, change in agent code if needed
- **Import errors**: Check that all dependencies are installed
- **AWS permissions**: Verify IAM roles and policies for deployment

### Logs

Check AgentCore logs:
```bash
# Local deployment logs
docker logs <container_id>

# AWS deployment logs in CloudWatch
```

## Contributing

1. Create a new agent using `make create-agent`
2. Implement your agent logic
3. Add comprehensive tests
4. Update documentation
5. Test deployment locally and on AWS

## Resources

- [Strands Agents Documentation](https://strandsagents.com/)
- [Amazon Bedrock AgentCore](https://docs.aws.amazon.com/bedrock/)
- [AgentCore Starter Toolkit](https://github.com/aws-samples/bedrock-agentcore-starter-kit)