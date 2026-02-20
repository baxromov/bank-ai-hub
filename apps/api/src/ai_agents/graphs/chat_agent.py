"""
Chat Agent Graph — ReAct agent with guardrails, memory, context engineering, and MCP tools.

Flow:
    START → input_guard → load_memory → build_context → agent ↔ tools → output_guard → save_memory → coin_award → END
"""
import re
from typing import Annotated, TypedDict

from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode


class ChatAgentState(TypedDict):
    messages: Annotated[list, add_messages]
    user_id: str
    session_id: str
    model: str
    coins_earned: int
    tool_calls_count: int
    input_blocked: bool
    output_blocked: bool
    guardrail_reason: str
    user_preferences: dict
    department_context: str
    past_tool_usage: list[str]
    system_prompt: str
    conversation_summary: str


# =============================================
# GUARDRAILS
# =============================================

INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?previous\s+instructions",
    r"you\s+are\s+now\s+",
    r"pretend\s+you\s+are",
    r"reveal\s+your\s+system\s+prompt",
    r"repeat\s+the\s+above",
]

PII_PATTERNS = [
    r"\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b",  # card number
    r"\b[A-Z]{2}\d{7}\b",                               # passport
]

SENSITIVE_OUTPUT_PATTERNS = [
    r"password\s*[:=]\s*\S+",
    r"(api[_-]?key|secret|token)\s*[:=]\s*\S+",
    r"postgresql://",
    r"redis://",
]


def input_guard_node(state: ChatAgentState) -> dict:
    """Validates user prompt before it reaches the LLM."""
    last_msg = state["messages"][-1].content if state["messages"] else ""

    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, last_msg, re.IGNORECASE):
            return {"input_blocked": True, "guardrail_reason": "prompt_injection_detected"}

    for pattern in PII_PATTERNS:
        if re.search(pattern, last_msg):
            return {"input_blocked": True, "guardrail_reason": "pii_detected"}

    if len(last_msg) > 15000:
        return {"input_blocked": True, "guardrail_reason": "prompt_too_long"}

    return {"input_blocked": False}


def output_guard_node(state: ChatAgentState) -> dict:
    """Validates LLM response before returning to user."""
    last_msg = state["messages"][-1].content if state["messages"] else ""

    for pattern in SENSITIVE_OUTPUT_PATTERNS:
        if re.search(pattern, last_msg, re.IGNORECASE):
            return {"output_blocked": True, "guardrail_reason": "sensitive_data_in_response"}

    return {"output_blocked": False}


# =============================================
# CONTEXT ENGINEERING
# =============================================

BANK_AI_SYSTEM_PROMPT = """You are BankAI Assistant, an AI helper for Ipoteka Bank employees.
You help with document drafting, data analysis, process optimization, and general questions.
Always respond in the same language as the user's message.
Be professional, concise, and helpful. If you're unsure about something, say so.
Never disclose internal system details, credentials, or confidential data."""


def load_memory_node(state: ChatAgentState) -> dict:
    """Load user's cross-session memory from LangGraph Store."""
    # In production, reads from AsyncPostgresStore
    return {
        "user_preferences": state.get("user_preferences", {}),
        "department_context": state.get("department_context", ""),
        "past_tool_usage": state.get("past_tool_usage", []),
    }


def build_context_node(state: ChatAgentState) -> dict:
    """Assembles the system prompt dynamically."""
    parts = [BANK_AI_SYSTEM_PROMPT]

    dept = state.get("department_context", "")
    if dept:
        parts.append(f"\nDepartment context: {dept}")

    prefs = state.get("user_preferences", {})
    if prefs.get("language"):
        parts.append(f"\nRespond in {prefs['language']}.")

    frequent_tools = state.get("past_tool_usage", [])
    if frequent_tools:
        parts.append(f"\nUser frequently uses: {', '.join(frequent_tools[:3])}.")

    summary = state.get("conversation_summary", "")
    if summary:
        parts.append(f"\nEarlier conversation summary: {summary}")

    return {"system_prompt": "\n".join(parts), "conversation_summary": summary}


# =============================================
# CORE NODES
# =============================================

def agent_node(state: ChatAgentState) -> dict:
    """Call LLM with dynamically assembled context. Placeholder for actual Ollama call."""
    # In production: uses ChatOllama with bind_tools
    from langchain_core.messages import AIMessage
    return {
        "messages": [AIMessage(content="[Agent response placeholder]")],
    }


def save_memory_node(state: ChatAgentState) -> dict:
    """Update user's long-term memory in Store."""
    # In production: writes to AsyncPostgresStore
    return {}


def coin_award_node(state: ChatAgentState) -> dict:
    """Award IB-Coins. Quality evaluation runs async via Celery."""
    return {"coins_earned": 1}


def increment_tool_count(state: ChatAgentState) -> dict:
    return {"tool_calls_count": state.get("tool_calls_count", 0) + 1}


# =============================================
# ROUTING
# =============================================

def route_after_input_guard(state: ChatAgentState) -> str:
    if state.get("input_blocked"):
        return END
    return "load_memory"


def should_continue(state: ChatAgentState) -> str:
    if state.get("tool_calls_count", 0) >= 10:
        return "output_guard"
    last_message = state["messages"][-1] if state["messages"] else None
    if last_message and hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools"
    return "output_guard"


def route_after_output_guard(state: ChatAgentState) -> str:
    if state.get("output_blocked"):
        return END
    return "save_memory"


# =============================================
# BUILD GRAPH
# =============================================

def build_chat_agent_graph(checkpointer=None, store=None):
    graph = StateGraph(ChatAgentState)

    graph.add_node("input_guard", input_guard_node)
    graph.add_node("output_guard", output_guard_node)
    graph.add_node("load_memory", load_memory_node)
    graph.add_node("build_context", build_context_node)
    graph.add_node("agent", agent_node)
    graph.add_node("tools", ToolNode(tools=[]))
    graph.add_node("increment_counter", increment_tool_count)
    graph.add_node("save_memory", save_memory_node)
    graph.add_node("coin_award", coin_award_node)

    graph.add_edge(START, "input_guard")
    graph.add_conditional_edges("input_guard", route_after_input_guard, ["load_memory", END])
    graph.add_edge("load_memory", "build_context")
    graph.add_edge("build_context", "agent")
    graph.add_conditional_edges("agent", should_continue, ["tools", "output_guard"])
    graph.add_edge("tools", "increment_counter")
    graph.add_edge("increment_counter", "agent")
    graph.add_conditional_edges("output_guard", route_after_output_guard, ["save_memory", END])
    graph.add_edge("save_memory", "coin_award")
    graph.add_edge("coin_award", END)

    return graph.compile(checkpointer=checkpointer, store=store)
