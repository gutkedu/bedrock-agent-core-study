# Coordinator Lambda Function

## Overview

The **CoordinatorFunction** is a Lambda that acts as an HTTP proxy to communicate with a Bedrock AgentCore coordinator agent using the A2A (Agent-to-Agent) protocol.

## Architecture

```
API Gateway → CoordinatorFunction (Lambda) → A2A Client → Coordinator Agent
                                                              ↓
                                                         (Your future agent)
```

## How It Works

1. **API Gateway** receives POST request at `/coordinator` endpoint
2. **Lambda** extracts the message from request body
3. **A2A Client** communicates with coordinator agent using bearer token
4. **Agent Response** is returned back through Lambda to API Gateway

## API Contract

### Request

```http
POST /api/coordinator
Content-Type: application/json

{
  "message": "Your message to the coordinator agent"
}
```

### Response (Success)

```json
{
  "message": "Success",
  "agent_response": "Response from the coordinator agent"
}
```

### Response (Error)

```json
{
  "error": "Error message description"
}
```

## Environment Variables

The Lambda requires two environment variables:

- **COORDINATOR_AGENT_URL**: The AgentCore runtime URL for your coordinator agent
  - Example: `https://bedrock-agentcore.us-east-1.amazonaws.com/runtimes/arn:aws:bedrock:us-east-1:123456789012:agent/AGENT_ID/invocations`
  
- **BEARER_TOKEN**: Authorization token for the agent
  - This is passed securely via CloudFormation parameters (NoEcho: true)

## Deployment

### 1. Set Parameters

When deploying, you need to provide:

```bash
cd infra/stateless

sam deploy \
  --parameter-overrides \
    CoordinatorAgentUrl="YOUR_AGENT_URL" \
    BearerToken="YOUR_BEARER_TOKEN"
```

Or add to `samconfig.toml`:

```toml
[default.deploy.parameters]
parameter_overrides = [
  "CoordinatorAgentUrl=YOUR_AGENT_URL",
  "BearerToken=YOUR_BEARER_TOKEN"
]
```

### 2. Deploy

```bash
# From infra/stateless
sam deploy --profile gutkedu-terraform --region us-east-1
```

### 3. Get API Endpoint

```bash
aws cloudformation describe-stacks \
  --stack-name StatelessStack \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayURL`].OutputValue' \
  --output text
```

## Testing

### Local Testing (requires env vars)

```bash
# Set environment variables
export COORDINATOR_AGENT_URL="YOUR_AGENT_URL"
export BEARER_TOKEN="YOUR_TOKEN"

# Invoke locally
cd backend/python
sam local invoke CoordinatorFunction -e events/coordinator-event.json
```

### Remote Testing

```bash
# Get your API Gateway URL
API_URL=$(aws cloudformation describe-stacks \
  --stack-name StatelessStack \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayURL`].OutputValue' \
  --output text)

# Test the endpoint
curl -X POST "${API_URL}coordinator" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello coordinator!"}'
```

## Dependencies

The Lambda uses the following Python packages (installed automatically via SAM):

- `bedrock-agentcore` - AWS Bedrock AgentCore SDK
- `strands-agents[a2a]` - A2A protocol implementation
- `strands-agents-tools` - Agent tools
- `httpx` - Async HTTP client

See `src/lambdas/coordinator/requirements.txt` for full list.

## Lambda Configuration

- **Timeout**: 300 seconds (5 minutes) - agents can take time to respond
- **Memory**: 512 MB (from Globals)
- **Runtime**: Python 3.12
- **Architecture**: ARM64 (cost-optimized)

## Future Enhancements

When you create your coordinator agent:

1. Update `CoordinatorAgentUrl` parameter with your agent's runtime URL
2. Generate and set the `BearerToken` for authentication
3. The Lambda is ready to communicate with your agent!

## Error Handling

The Lambda handles:

- ✅ Timeout errors (300s max)
- ✅ HTTP errors from agent
- ✅ Missing/invalid request body
- ✅ Missing environment variables
- ✅ Agent communication failures

All errors are logged to CloudWatch and returned with appropriate HTTP status codes.

## Monitoring

View logs:

```bash
# Stream logs
sam logs -n CoordinatorFunction --stack-name StatelessStack-PythonBackendStackApp-XXXXX --tail

# Or via AWS CLI
aws logs tail /aws/lambda/CoordinatorFunction --follow
```

Check metrics in CloudWatch:
- Invocations
- Duration
- Errors
- Throttles

## Security Best Practices

✅ **NoEcho Parameter** - Bearer token is marked NoEcho in CloudFormation  
✅ **Environment Variables** - Sensitive data passed via env vars, not hardcoded  
✅ **IAM Permissions** - Lambda has minimal required permissions  
✅ **API Gateway** - Can add authorization/rate limiting as needed  

## Troubleshooting

### "Coordinator agent URL not configured"
- Ensure `CoordinatorAgentUrl` parameter is set during deployment

### "Authentication token not configured"
- Ensure `BearerToken` parameter is set during deployment

### "Request timeout"
- Agent took longer than 5 minutes to respond
- Consider increasing Lambda timeout if needed

### "HTTP error: 401/403"
- Check bearer token is valid
- Verify agent permissions
