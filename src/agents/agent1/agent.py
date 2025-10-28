from bedrock_agentcore import BedrockAgentCoreApp
from strands import Agent
from strands_tools import http_request
from strands.models import BedrockModel
import json

WEATHER_SYSTEM_PROMPT = """You are a weather assistant with HTTP capabilities. You can:

1. Make HTTP requests to the National Weather Service API
2. Process and display weather forecast data
3. Provide weather information for locations in the United States

When retrieving weather information:
1. First get the coordinates or grid information using https://api.weather.gov/points/{latitude},{longitude} or https://api.weather.gov/points/{zipcode}
2. Then use the returned forecast URL to get the actual forecast

When displaying responses:
- Format weather data in a human-readable way
- Highlight important information like temperature, precipitation, and alerts
- Handle errors appropriately
- Convert technical terms to user-friendly language

Always explain the weather conditions clearly and provide context for the forecast.
"""

app = BedrockAgentCoreApp()

bedrock_model = BedrockModel(
    model_id="us.amazon.nova-premier-v1:0",
    temperature=0.3,
    top_p=0.8,
)

agent = Agent(
    model=bedrock_model,
    tools=[http_request],
    system_prompt=WEATHER_SYSTEM_PROMPT
    )

@app.entrypoint
def invoke(payload):
    """Your AI agent function with tool capabilities"""
    try:
        # Handle case where payload might be a string that needs parsing
        if isinstance(payload, str):
            try:
                payload = json.loads(payload)  # Try to parse as JSON
            except json.JSONDecodeError:
                user_message = payload
            else:
                user_message = payload.get("prompt", "")
        else:
            user_message = payload.get("prompt", "")
        
        result = agent(user_message)
        return {"result": result.message}
    except Exception as e:
        return {"error": f"Failed to process request: {str(e)}", "result": "I apologize, but I encountered an error processing your request."}

if __name__ == "__main__":
    app.run()


