from bedrock_agentcore import BedrockAgentCoreApp
from strands import Agent
import json

# Agent configuration
AGENT_CONFIG = {
    "name": "agent1",
    "version": "1.0.0",
    "description": "Basic conversational agent using Strands",
    "model": "amazon.titan-text-lite-v1",  # Amazon Titan Text Lite (works with on-demand)
    "max_tokens": 1000,
    "temperature": 0.7,
    "system_prompt": "You are a helpful AI assistant."
}

app = BedrockAgentCoreApp()
agent = Agent(model=AGENT_CONFIG["model"])  # Specify the model explicitly

@app.entrypoint
def invoke(payload):
    """Your AI agent function"""
    try:
        # Handle case where payload might be a string that needs parsing
        if isinstance(payload, str):
            payload = json.loads(payload)

        user_message = payload.get("prompt", "Hello! How can I help you today?")
        result = agent(user_message)
        return {"result": result.message}
    except Exception as e:
        return {"error": f"Failed to process request: {str(e)}", "result": "I apologize, but I encountered an error processing your request."}

if __name__ == "__main__":
    app.run()