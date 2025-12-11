import json
import os
import logging
from typing import Annotated, List, Dict, Any, Optional
from pydantic import BaseModel, Field
from langgraph.graph import StateGraph, END, START, MessagesState
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage, BaseMessage
from langchain_openai import ChatOpenAI
from langchain_core.runnables import RunnableConfig
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load env
load_dotenv("../.env")

# --- Agent State ---
class AgentState(MessagesState):
    appState: Dict[str, Any]
    userInfo: Optional[Dict[str, Any]]
    hitltools: Optional[List[Dict[str, Any]]]
    dwftools: Optional[List[Dict[str, Any]]]
    hitlRequest: Optional[Dict[str, Any]]

# --- Prompt Construction ---
def get_system_prompt(state: AgentState) -> str:
    app_state = state.get("appState", {})
    user_info = state.get("userInfo", {})
    hitl_tools = state.get("hitltools", [])
    dwf_tools = state.get("dwftools", [])
    hitl_request = state.get("hitlRequest", None)
    
    def to_json(obj, default="无"):
        return json.dumps(obj, ensure_ascii=False) if obj else default

    # Construct the prompt
    prompt = f"""你是一个智能 AGUI 助手。你的目标是根据用户的输入、当前页面状态以及用户是否正在回应一个 HITL (Human-In-The-Loop) 请求来生成响应。

请使用 Markdown 语法进行格式化。

**当前登录用户的信息**
{to_json(user_info, "{}")}
**用户所在页面:**
{app_state.get("currentPage", "unknown")}

**所在的页面数据:**
{to_json(app_state.get("pageData", []), "[]")}

**该页面支持的 HITL actions 有:**
{to_json(hitl_tools, "无可用 HITL actions")}

**该页面提供的可调用的前台函数 (dwftools) 有:**
{to_json(dwf_tools, "无可用 dwftools")}

**当前 HITL 请求上下文 (如果存在):**
{to_json(hitl_request, "无")}

---

### 你的任务逻辑

你需要分析用户的意图，并严格按照以下优先级和格式生成响应：

#### 1. 处理 HITL 确认 (最高优先级)
如果 **HITL 上下文 (hitlRequest)** 存在，且用户的输入表明 **"确认"** (例如 "confirmed", "是", "确认", "OK", "Proceed")：
你需要生成一个 **TOOL CALL**，执行 hitlRequest.action，并传入 hitlRequest.data 中的所有参数。这是执行操作的唯一机会。

**必须严格遵守以下 JSON 格式返回 (不要包含 Markdown 代码块标记,也不要在该类型的json代码中添加任何注释):**
```json
{{
  "message": "用户已确认，正在执行操作...",
  "action": "hitlRequest.action",
  "data": {{ 
      "id": "hitlRequest.data.id" 
  }}
}}
```
*重要提示：为避免 `[object Object]` 错误，你需要手动从 `hitlRequest.data` 中提取 `id` 的值，并确保其格式正确（带引号的字符串或 JSON 数组）。*

如果用户的输入表明 **"取消"**，请返回一段普通文本，告知用户操作已取消。

#### 2. 发起 HITL 请求 (敏感操作)
如果用户请求执行 **hitltoos** 中的敏感操作（例如 "删除", "修改关键数据"）：
不要直接执行。而是返回一个 JSON 对象来发起 HITL 确认请求。

**输出格式 (JSON):**
```json
{{
  "hitl": true,
  "message": "您确定要执行此操作吗？",
  "action": "目标Action名称",
  "data": {{ ...参数... }}
}}
```

#### 3. 调用前台函数 (dwftools)
如果用户的意图可以通过 **dwftools** 中的函数实现（例如 "新增一行", "刷新列表"）：
返回一个 JSON 对象来调用该函数。

**输出格式 (JSON):**
```json
{{
  "action": "函数名 (例如 addRow)",
  "data": {{ ...参数... }}
}}
```

#### 4. (*重要)普通聊天/查询
如果用户的意图是询问信息、闲聊或不涉及上述操作：
直接返回 Markdown 格式的文本回答。

**其他要求:**
- `ptype` 是关键的必填项, 请确保用户输入的 `ptype` 是有效的。系统支持的 `ptype` 类型, 请使用工具查询 DB。因为页面上的可能不全。
- 新增时你可以根据相似数据(根据工具查询)来推测要回填至表单的数据。
"""
    return prompt

# --- Nodes ---
async def call_model(state: AgentState, config: RunnableConfig):
    system_prompt = get_system_prompt(state)
    messages = [SystemMessage(content=system_prompt)] + state["messages"]
    
    # Initialize model
    # You might want to make model configurable via config
    api_key = os.getenv("OPENAI_API_KEY")
    base_url = os.getenv("OPENAI_API_BASE_URL") or os.getenv("OPENAI_API_BASE")
    model_name = os.getenv("MODEL", "gpt-3.5-turbo")
    
    model = ChatOpenAI(
        temperature=0,
        api_key=api_key,
        base_url=base_url,
        model=model_name
    )
    
    response = await model.ainvoke(messages, config)
    return {"messages": [response]}

# --- Graph ---
workflow = StateGraph(AgentState)

workflow.add_node("agent", call_model)
workflow.add_edge(START, "agent")
workflow.add_edge("agent", END)

app = workflow.compile()
