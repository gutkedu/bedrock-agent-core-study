.PHONY: help install build deploy test clean logs validate

# Colors for output
CYAN := \033[0;36m
NC := \033[0m # No Color

help: ## Show this help message
	@echo '$(CYAN)Available commands:$(NC)'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(CYAN)%-15s$(NC) %s\n", $$1, $$2}'

install: ## Install dependencies
	@echo "$(CYAN)Installing dependencies...$(NC)"
	pip install pytest pytest-cov boto3

build: ## Build the Lambda function
	@echo "$(CYAN)Building Lambda function...$(NC)"
	chmod +x package_lambda.sh
	./package_lambda.sh

deploy: build ## Deploy via parent stack (from infra/stateless)
	@echo "$(CYAN)Deploying parent stack...$(NC)"
	cd ../../infra/stateless && sam deploy

test: ## Run unit tests
	@echo "$(CYAN)Running tests...$(NC)"
	pytest tests/unit/ -v

test-coverage: ## Run tests with coverage
	@echo "$(CYAN)Running tests with coverage...$(NC)"
	pytest --cov=src tests/unit/ -v

local-invoke: build ## Invoke function locally
	@echo "$(CYAN)Invoking function locally...$(NC)"
	sam local invoke HelloFunction -e events/event.json

logs: ## Stream CloudWatch logs
	@echo "$(CYAN)Streaming logs (update stack name if needed)...$(NC)"
	@echo "Note: Replace XXXXX with your actual nested stack ID"
	sam logs -n HelloFunction --stack-name StatelessStack-PythonBackendStackApp-XXXXX --tail

clean: ## Clean build artifacts
	@echo "$(CYAN)Cleaning artifacts...$(NC)"
	rm -rf artifacts/
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	rm -f response.json

validate: ## Validate SAM template
	@echo "$(CYAN)Validating template...$(NC)"
	sam validate
