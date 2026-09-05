"""
RevGuard AI — LangGraph State Graph Definition
This is the core orchestration layer that connects all nodes into a
directed acyclic graph with conditional routing.

Graph Flow:
  START → detect → diagnose → guardrail_check → (pass?) → execute → audit → END
                                                 (fail?) → audit → END (BLOCKED)
"""

from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from state import AgentState
from nodes import (
    detect_node,
    diagnose_node,
    guardrail_check_node,
    execute_node,
    audit_node,
)


def should_execute(state: AgentState) -> str:
    """
    Conditional edge after guardrail_check:
    - If guardrails passed → go to execute
    - If guardrails blocked → skip to audit (with BLOCKED status)
    """
    if state.get("guardrail_passed", True):
        return "execute"
    else:
        return "audit"


def build_recovery_graph() -> StateGraph:
    """
    Builds and compiles the RevGuard AI recovery agent graph.

    The graph structure:
    ┌───────┐   ┌──────────┐   ┌────────────────┐   ┌─────────┐   ┌───────┐
    │DETECT │ → │ DIAGNOSE │ → │GUARDRAIL_CHECK │ → │ EXECUTE │ → │ AUDIT │ → END
    └───────┘   └──────────┘   └────────┬───────┘   └─────────┘   └───────┘
                                        │ (blocked)                    ▲
                                        └──────────────────────────────┘
    """
    graph = StateGraph(AgentState)

    # Add all nodes
    graph.add_node("detect", detect_node)
    graph.add_node("diagnose", diagnose_node)
    graph.add_node("guardrail_check", guardrail_check_node)
    graph.add_node("execute", execute_node)
    graph.add_node("audit", audit_node)

    # Set entry point
    graph.set_entry_point("detect")

    # Add edges (the flow)
    graph.add_edge("detect", "diagnose")
    graph.add_edge("diagnose", "guardrail_check")

    # Conditional edge: guardrail check decides whether to execute or skip to audit
    graph.add_conditional_edges(
        "guardrail_check",
        should_execute,
        {
            "execute": "execute",
            "audit": "audit",
        }
    )

    graph.add_edge("execute", "audit")
    graph.add_edge("audit", END)

    # Compile the graph with MemorySaver checkpointer for thread persistence & resumption
    checkpointer = MemorySaver()
    compiled = graph.compile(checkpointer=checkpointer)
    return compiled


# Pre-build the graph (singleton)
recovery_agent = build_recovery_graph()
