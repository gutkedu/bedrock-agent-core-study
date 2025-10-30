import logging  
import os  
from strands_tools.calculator import calculator  
from strands import Agent  
from strands.multiagent.a2a import A2AServer  
from strands.models import BedrockModel
import uvicorn  
from fastapi import FastAPI  

logging.basicConfig(level=logging.INFO)  

# Use the complete runtime URL from environment variable, fallback to local  
runtime_url = os.environ.get('AGENTCORE_RUNTIME_URL', 'http://127.0.0.1:9000/')  

logging.info(f"Runtime URL: {runtime_url}")  

# Define a calculator-focused system prompt that instructs the agent how to use the calculator tool
# to perform mathematical operations.
CALCULATOR_SYSTEM_PROMPT = """You are a calculator assistant with advanced mathematical capabilities. You can:

1. Perform basic arithmetic operations (addition, subtraction, multiplication, division)
2. Evaluate complex mathematical expressions
3. Solve equations and systems of equations
4. Calculate derivatives and integrals
5. Evaluate limits and series expansions
6. Perform matrix operations

When asked to perform calculations:
1. Use the calculator tool to compute the result
2. Provide clear, formatted results
3. Explain the calculation when appropriate
4. Handle mathematical constants like pi and e
5. Use appropriate precision for the result

Always provide accurate mathematical results and explain your calculations clearly.
"""

bedrock_model = BedrockModel(
    model_id="us.amazon.nova-premier-v1:0",
    temperature=0.3,
    top_p=0.8,
)

strands_agent = Agent(  
    name="Calculator Agent",
    description="A calculator agent that can perform basic arithmetic operations.",
    model=bedrock_model,
    tools=[calculator],
    system_prompt=CALCULATOR_SYSTEM_PROMPT,
    callback_handler=None
)

host, port = "0.0.0.0", 9000  

# Pass runtime_url to http_url parameter AND use serve_at_root=True  
a2a_server = A2AServer(  
    agent=strands_agent,  
    http_url=runtime_url,  
    serve_at_root=True  # Serves locally at root (/) regardless of remote URL path complexity  
)  

app = FastAPI()  

@app.get("/ping")  
def ping():  
    return {"status": "healthy"}  

app.mount("/", a2a_server.to_fastapi_app())  

if __name__ == "__main__":  
    uvicorn.run(app, host=host, port=port)