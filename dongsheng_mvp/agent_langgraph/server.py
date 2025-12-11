import os
import json
import uvicorn
import logging
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from graph import app as agent_app

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv("../.env")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from langchain_core.messages import HumanMessage

@app.post("/webhook/agent/message")
async def agent_message(request: Request):
    data = await request.json()
    logger.info(f"Received request: {json.dumps(data, ensure_ascii=False)}")
    
    # Map input to AgentState
    # Extract all necessary fields from the request
    tools = data.get("tools", {})
    initial_state = {
        "messages": [HumanMessage(content=data.get("chatInput", ""))],
        "appState": data.get("appState", {}),
        "userInfo": data.get("appState", {}).get("userInfo", {}) or data.get("userInfo", {}),
        "hitltools": tools.get("hitltools", []) if tools else data.get("hitltools", []),
        "dwftools": tools.get("dwftools", []) if tools else data.get("dwftools", []),
        "hitlRequest": data.get("hitlRequest", None)
    }
    
    # If userInfo is not in appState, try top level (just in case)
    if not initial_state["userInfo"] and "userInfo" in data:
        initial_state["userInfo"] = data["userInfo"]

    async def event_generator():
        # Stream events from LangGraph
        logger.info("Starting LangGraph stream...")
        async for event in agent_app.astream_events(initial_state, version="v1"):
            kind = event["event"]
            logger.debug(f"Event received: {kind}")
            
            if kind == "on_chat_model_stream":
                content = event["data"]["chunk"].content
                if content:
                    # Format as expected by frontend
                    payload = {
                        "type": "item",
                        "content": content
                    }
                    # Use NDJSON format: <json>\n
                    yield f"{json.dumps(payload)}\n"
            
            elif kind == "on_custom_event":
                if event["name"] == "manually_emit_intermediate_state":
                    payload = {
                        "type": "state_update",
                        "state": event["data"]
                    }
                    yield f"{json.dumps(payload)}\n"
                    
        logger.info("LangGraph stream finished.")
        # yield "data: [DONE]\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
