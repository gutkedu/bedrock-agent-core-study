# Bedrock AgentCore Multi-Agent Study

A scalable multi-agent project demonstrating agent-to-agent patterns and deployment options using Amazon Bedrock AgentCore and Strands Agents with tool integration.

## Project Structure

```
bedrock-agent-core-study/
├── src/                      # Main source code directory
│   ├── agents/               # Individual agent implementations
│   │   └── agent1/           # Example agent with web tools
│   │       ├── __init__.py
│   │       ├── agent.py      # Main agent logic with config variables
│   │       ├── requirements.txt  # Agent dependencies
│   │       └── tests/        # Agent tests
│   └── shared/               # Shared utilities and tools
│       ├── __init__.py
│       └── web_tools.py     # Web access tools (reusable across agents)
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
- `src/agents/my_new_agent/agent.py` - Implement your agent logic
- `src/agents/my_new_agent/requirements.txt` - Add agent-specific dependencies

## Agent Development

### Agent Structure

Each agent should have:
- `src/agents/{agent_name}/agent.py` - Main entrypoint with `@app.entrypoint` decorator and configuration variables
- `src/agents/{agent_name}/requirements.txt` - Agent dependencies
- `src/agents/{agent_name}/tests/test_agent.py` - Unit tests

Agents can import and use shared tools from `src/shared/` for common functionality.

### Configuration

Agent configurations are defined as Python variables within each agent's `agent.py`:

```python
# Agent configuration
AGENT_CONFIG = {
    "name": "agent1",
    "version": "1.0.0",
    "description": "Conversational agent with web access tools using Strands",
    "model": "amazon.titan-text-lite-v1",
    "max_tokens": 1000,
    "temperature": 0.7,
    "system_prompt": "You are a helpful AI assistant with access to web tools."
}
```

## Tools Integration

Agents can be extended with tools to perform specific tasks like web access, calculations, and data retrieval.

### Available Tools

**Custom Tools** (in `agents/agent1/web_tools.py`):
- `web_get(url)` - Fetch content from any web URL
- `search_web(query)` - Perform web searches (placeholder implementation)
- `get_weather_info(location)` - Get weather for a location (placeholder implementation)

### Using Tools in Agents

Tools are loaded automatically when the agent starts:

```python
from strands.tools.loader import load_tools_from_module

# Load tools from a module
tools = load_tools_from_module("web_tools")

# Create agent with tools
agent = Agent(model="amazon.titan-text-lite-v1", tools=tools)
```

### Creating Custom Tools

Tools are created using the `@tool` decorator:

```python
from strands import tool

@tool
def my_custom_tool(param1: str, param2: int = 10) -> str:
    """Tool description and docstring."""
    # Tool implementation
    return f"Result: {param1} with {param2}"
```

### Example Tool Usage

```bash
# Test web access
make test-endpoint AGENT=agent1 PROMPT="Use web_get to fetch content from https://httpbin.org/get"

# Test weather information
make test-endpoint AGENT=agent1 PROMPT="What's the weather like in New York?"
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
2. **Develop**: Edit `src/agents/new_agent/agent.py`
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