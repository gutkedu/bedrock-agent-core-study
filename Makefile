.PHONY: help setup install install-agentcore configure-agent deploy-local deploy-aws test test-agent run-agent clean clean-agent list-agents create-agent

# Default target
help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-25s %s\n", $$1, $$2}'
	@echo ""
	@echo "AWS Profile: $(AWS_PROFILE) (change with: make <command> AWS_PROFILE=your-profile)"

# Environment setup
setup: ## Create virtual environment and install base dependencies
	@echo "Setting up Python virtual environment..."
	python3 -m venv .venv
	@echo "Virtual environment created. Run 'source .venv/bin/activate.fish' to activate."

install: ## Install all dependencies (shared + all agents)
	@echo "Installing shared dependencies..."
	. .venv/bin/activate && pip install -r requirements.txt
	@echo "Installing agent dependencies..."
	@for agent in $$(find src/agents -name "requirements.txt" -exec dirname {} \; | sed 's|src/agents/||'); do \
		echo "Installing requirements for $$agent..."; \
		. .venv/bin/activate && pip install -r src/agents/$$agent/requirements.txt; \
	done

install-agentcore: ## Install AgentCore starter toolkit
	@echo "Installing AgentCore starter toolkit..."
	. .venv/bin/activate && pip install bedrock-agentcore

# Agent management
list-agents: ## List all available agents
	@echo "Available agents:"
	@ls -1 src/agents/ | sed 's/^/  - /'

create-agent: ## Create a new agent (usage: make create-agent AGENT_NAME=my_new_agent)
	@if [ -z "$(AGENT_NAME)" ]; then \
		echo "Error: AGENT_NAME is required. Usage: make create-agent AGENT_NAME=my_new_agent"; \
		exit 1; \
	fi
	@echo "Creating new agent: $(AGENT_NAME)"
	@mkdir -p src/agents/$(AGENT_NAME)/tests
	@echo "# $(AGENT_NAME) package" > src/agents/$(AGENT_NAME)/__init__.py
	@echo "# $(AGENT_NAME) tests package" > src/agents/$(AGENT_NAME)/tests/__init__.py
	@cp src/agents/agent1/agent.py src/agents/$(AGENT_NAME)/agent.py
	@cp src/agents/agent1/requirements.txt src/agents/$(AGENT_NAME)/requirements.txt
	@sed -i 's/"name": "agent1"/"name": "$(AGENT_NAME)"/g' src/agents/$(AGENT_NAME)/agent.py
	@echo "Agent $(AGENT_NAME) created. Edit src/agents/$(AGENT_NAME)/agent.py as needed."

# Configuration
configure-agent: ## Configure an agent for AgentCore (usage: make configure-agent AGENT=agent1)
	@if [ -z "$(AGENT)" ]; then \
		echo "Error: AGENT is required. Usage: make configure-agent AGENT=agent1"; \
		exit 1; \
	fi
	@echo "Configuring agent: $(AGENT)"
	. .venv/bin/activate && agentcore configure --entrypoint src/agents/$(AGENT)/agent.py

# Local development
run-agent: ## Run an agent locally (usage: make run-agent AGENT=agent1)
	@if [ -z "$(AGENT)" ]; then \
		echo "Error: AGENT is required. Usage: make run-agent AGENT=agent1"; \
		exit 1; \
	fi
	@echo "Running agent $(AGENT) locally..."
	. .venv/bin/activate && cd src/agents/$(AGENT) && python agent.py

test: ## Run all agent tests
	@echo "Running all agent tests..."
	. .venv/bin/activate && python -m pytest src/agents/*/tests/ -v

test-agent: ## Run tests for a specific agent (usage: make test-agent AGENT=agent1)
	@if [ -z "$(AGENT)" ]; then \
		echo "Error: AGENT is required. Usage: make test-agent AGENT=agent1"; \
		exit 1; \
	fi
	@echo "Running tests for agent: $(AGENT)"
	. .venv/bin/activate && python -m pytest src/agents/$(AGENT)/tests/ -v

# Deployment
deploy-local: ## Deploy an agent locally using AgentCore (usage: make deploy-local AGENT=agent1)
	@if [ -z "$(AGENT)" ]; then \
		echo "Error: AGENT is required. Usage: make deploy-local AGENT=agent1"; \
		exit 1; \
	fi
	@echo "Deploying agent $(AGENT) locally..."
	. .venv/bin/activate && agentcore launch --local --agent $(AGENT)

deploy-aws: ## Deploy an agent to AWS using AgentCore (usage: make deploy-aws AGENT=agent1)
	@if [ -z "$(AGENT)" ]; then \
		echo "Error: AGENT is required. Usage: make deploy-aws AGENT=agent1"; \
		exit 1; \
	fi
	@echo "Deploying agent $(AGENT) to AWS..."
	. .venv/bin/activate && agentcore launch --agent $(AGENT)

# Testing deployed agents
test-endpoint: ## Test a deployed agent endpoint (usage: make test-endpoint AGENT=agent1 PROMPT="Hello")
	@if [ -z "$(AGENT)" ] || [ -z "$(PROMPT)" ]; then \
		echo "Error: AGENT and PROMPT are required. Usage: make test-endpoint AGENT=agent1 PROMPT=\"Hello\""; \
		exit 1; \
	fi
	@echo "Testing agent $(AGENT) with prompt: $(PROMPT)"
	curl -X POST http://localhost:8080/invocations \
		-H "Content-Type: application/json" \
		-d "{\"prompt\": \"$(PROMPT)\"}"

# Cleanup
clean: ## Clean up all build artifacts and temporary files
	@echo "Cleaning up..."
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type f -name "*.pyd" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type d -name ".coverage" -exec rm -rf {} +

clean-agent: ## Clean up a specific agent (usage: make clean-agent AGENT=agent1)
	@if [ -z "$(AGENT)" ]; then \
		echo "Error: AGENT is required. Usage: make clean-agent AGENT=agent1"; \
		exit 1; \
	fi
	@echo "Cleaning up agent: $(AGENT)"
	rm -rf src/agents/$(AGENT)/__pycache__
	rm -f src/agents/$(AGENT)/*.pyc
	rm -rf src/agents/$(AGENT)/tests/__pycache__
	rm -f src/agents/$(AGENT)/tests/*.pyc

# Development helpers
lint: ## Run linting on all Python files
	@echo "Running linting..."
	. .venv/bin/activate && pip install flake8
	. .venv/bin/activate && flake8 src/agents/ --max-line-length=100

format: ## Format Python code using black
	@echo "Formatting code..."
	. .venv/bin/activate && pip install black
	. .venv/bin/activate && black src/agents/

# Docker helpers
build-docker: ## Build Docker image for an agent (usage: make build-docker AGENT=agent1)
	@if [ -z "$(AGENT)" ]; then \
		echo "Error: AGENT is required. Usage: make build-docker AGENT=agent1"; \
		exit 1; \
	fi
	@echo "Building Docker image for agent: $(AGENT)"
	docker build -t bedrock-agentcore-$(AGENT) -f .bedrock_agentcore/$(AGENT)/Dockerfile .

# Quick start commands
quick-start: setup install install-agentcore ## Quick start: setup environment and configure default agent
	@echo "Quick start complete! Run 'make deploy-local AGENT=agent1' to deploy locally."

# AWS Profile support
AWS_PROFILE ?= gutkedu-terraform

# AWS Profile enabled commands
deploy-aws-profile: ## Deploy to AWS using gutkedu-terraform profile (usage: make deploy-aws-profile AGENT=agent1)
	@if [ -z "$(AGENT)" ]; then \
		echo "Error: AGENT is required. Usage: make deploy-aws-profile AGENT=agent1"; \
		exit 1; \
	fi
	@echo "Deploying agent $(AGENT) to AWS using profile: $(AWS_PROFILE)"
	AWS_PROFILE=$(AWS_PROFILE) . .venv/bin/activate && agentcore launch --agent $(AGENT)

deploy-local-profile: ## Deploy locally using gutkedu-terraform profile (usage: make deploy-local-profile AGENT=agent1)
	@if [ -z "$(AGENT)" ]; then \
		echo "Error: AGENT is required. Usage: make deploy-local-profile AGENT=agent1"; \
		exit 1; \
	fi
	@echo "Deploying agent $(AGENT) locally using profile: $(AWS_PROFILE)"
	AWS_PROFILE=$(AWS_PROFILE) . .venv/bin/activate && agentcore launch --local --agent $(AGENT)

# Info
info: ## Show project information
	@echo "Bedrock AgentCore Multi-Agent Project"
	@echo "===================================="
	@echo "Agents found:"
	@ls -1 src/agents/ | sed 's/^/  - /'