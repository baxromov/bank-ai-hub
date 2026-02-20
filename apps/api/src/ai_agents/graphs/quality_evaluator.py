"""
Quality Evaluator Graph — Scores prompt/document/tool quality and maps to coin amount.
Includes interrupt for high awards (>30 coins) requiring admin approval.
"""
from typing import TypedDict


class QualityEvalState(TypedDict):
    action_type: str
    content: str
    context: dict
    quality_score: float
    coin_amount: int
    evaluation_reasoning: str
    user_id: str
    requires_approval: bool
    admin_decision: str


def classifier_node(state: QualityEvalState) -> dict:
    """Classify the action type for routing."""
    return {"action_type": state.get("action_type", "prompt")}


def evaluate_prompt_node(state: QualityEvalState) -> dict:
    """Evaluate prompt quality. In production, uses LLM-as-judge."""
    content = state.get("content", "")
    score = min(1.0, len(content) / 500)  # Placeholder scoring
    return {
        "quality_score": round(score, 2),
        "evaluation_reasoning": f"Prompt length: {len(content)} chars",
    }


def evaluate_document_node(state: QualityEvalState) -> dict:
    return {"quality_score": 0.7, "evaluation_reasoning": "Document evaluation placeholder"}


def evaluate_tool_node(state: QualityEvalState) -> dict:
    return {"quality_score": 0.8, "evaluation_reasoning": "Tool evaluation placeholder"}


def evaluate_suggestion_node(state: QualityEvalState) -> dict:
    return {"quality_score": 0.6, "evaluation_reasoning": "Suggestion evaluation placeholder"}


def score_to_coins_node(state: QualityEvalState) -> dict:
    """Map quality_score to coin amount. Flag for approval if above threshold."""
    score = state.get("quality_score", 0.0)
    action_type = state.get("action_type", "prompt")

    ranges = {
        "prompt": (1, 10),
        "document": (5, 30),
        "tool": (10, 50),
        "suggestion": (5, 40),
    }
    min_amt, max_amt = ranges.get(action_type, (1, 10))
    coins = min_amt + int((max_amt - min_amt) * score)
    needs_approval = coins > 30

    return {"coin_amount": coins, "requires_approval": needs_approval}


def approval_gate_node(state: QualityEvalState) -> dict:
    """INTERRUPT: Pause graph for admin approval if needed."""
    if state.get("requires_approval"):
        # In production: interrupt() call pauses graph
        # decision = interrupt({...})
        return {"admin_decision": "pending"}
    return {"admin_decision": "auto_approved"}


def finalize_node(state: QualityEvalState) -> dict:
    """Apply coin award if approved."""
    decision = state.get("admin_decision", "auto_approved")
    if decision in ("approved", "auto_approved"):
        # In production: calls CoinEconomy.earn_coins()
        pass
    return {}


def route_by_action(state: QualityEvalState) -> str:
    action_map = {
        "prompt": "evaluate_prompt",
        "document": "evaluate_document",
        "tool": "evaluate_tool",
        "suggestion": "evaluate_suggestion",
    }
    return action_map.get(state.get("action_type", "prompt"), "evaluate_prompt")


def build_quality_evaluator_graph(checkpointer=None):
    from langgraph.graph import StateGraph, START, END

    graph = StateGraph(QualityEvalState)

    graph.add_node("classifier", classifier_node)
    graph.add_node("evaluate_prompt", evaluate_prompt_node)
    graph.add_node("evaluate_document", evaluate_document_node)
    graph.add_node("evaluate_tool", evaluate_tool_node)
    graph.add_node("evaluate_suggestion", evaluate_suggestion_node)
    graph.add_node("score_to_coins", score_to_coins_node)
    graph.add_node("approval_gate", approval_gate_node)
    graph.add_node("finalize", finalize_node)

    graph.add_edge(START, "classifier")
    graph.add_conditional_edges("classifier", route_by_action, {
        "evaluate_prompt": "evaluate_prompt",
        "evaluate_document": "evaluate_document",
        "evaluate_tool": "evaluate_tool",
        "evaluate_suggestion": "evaluate_suggestion",
    })
    for node in ["evaluate_prompt", "evaluate_document", "evaluate_tool", "evaluate_suggestion"]:
        graph.add_edge(node, "score_to_coins")
    graph.add_edge("score_to_coins", "approval_gate")
    graph.add_edge("approval_gate", "finalize")
    graph.add_edge("finalize", END)

    return graph.compile(checkpointer=checkpointer)
