"""
RevGuard AI — FastAPI Server
Serves the LangGraph recovery agent as a REST API.
Next.js frontend calls this instead of handling logic internally.

Endpoints:
  POST /agent/recover   — Run full recovery workflow
  GET  /agent/health    — Health check
  GET  /agent/graph     — Returns graph structure (for visualization)
"""

import os
import sys
import json
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
from dotenv import load_dotenv

# Load .env.local from the parent directory (Next.js project root)
env_path = os.path.join(os.path.dirname(__file__), "..", ".env.local")
load_dotenv(env_path)

from graph import recovery_agent


# --- Request / Response Models ---

class RecoveryRequest(BaseModel):
    event_id: str = Field(default="", description="Unique event identifier for idempotency")
    merchant_id: str = Field(default="merchant_default", description="Multi-tenant merchant ID")
    event_type: str = Field(default="payment.failed", description="Razorpay event type")
    failure_code: str = Field(default="BAD_REQUEST_PAYMENT_TIMED_OUT", description="Razorpay failure code")
    amount: float = Field(default=2499, description="Transaction amount in INR")
    customer_name: str = Field(default="Customer", description="Customer name")
    customer_phone: str = Field(default="+919876543210", description="Customer phone")
    customer_email: str = Field(default="", description="Customer email")
    language: str = Field(default="hi", description="Recovery language code")
    max_retries: int = Field(default=2, description="Max outreach retries")
    min_voice_amount: float = Field(default=500, description="Min amount for voice calls")
    quiet_hours_start: int = Field(default=21, description="Quiet hours start (24h)")
    quiet_hours_end: int = Field(default=8, description="Quiet hours end (24h)")
    auto_halt_on_dnd: bool = Field(default=True, description="Auto-halt on DND")
    voice_consent: bool = Field(default=True, description="Customer voice call consent")
    thread_id: Optional[str] = Field(default=None, description="LangGraph execution thread ID for state resumption")


class RecoveryResponse(BaseModel):
    success: bool
    event_id: str
    merchant_id: str
    event_type: str
    diagnosis: str
    action: str
    channel: str
    risk_score: float
    explainability: str
    dialogue: str
    guardrail_passed: bool
    guardrail_reason: str
    payment_link_url: str
    payment_link_id: str
    whatsapp_sent: bool
    whatsapp_message: str
    voice_generated: bool
    voice_audio_base64: str
    final_status: str
    audit_log: str
    agent_trace: list
    timestamp: str


# --- FastAPI App ---

app = FastAPI(
    title="RevGuard AI — LangGraph Agent",
    description="AI Revenue Recovery Agent powered by LangGraph orchestration",
    version="1.0.0",
)

# CORS — allow Next.js to call this
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/agent/health")
async def health():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "agent": "RevGuard AI LangGraph Recovery Agent",
        "timestamp": datetime.now().isoformat(),
        "graph_nodes": ["detect", "diagnose", "guardrail_check", "execute", "audit"],
    }


@app.get("/agent/graph")
async def get_graph():
    """Returns the graph structure for visualization."""
    return {
        "nodes": [
            {"id": "detect", "label": "Detect Event", "type": "input"},
            {"id": "diagnose", "label": "AI Diagnosis", "type": "llm"},
            {"id": "guardrail_check", "label": "Guardrail Check", "type": "decision"},
            {"id": "execute", "label": "Execute Recovery", "type": "action"},
            {"id": "audit", "label": "Audit Trail", "type": "output"},
        ],
        "edges": [
            {"from": "detect", "to": "diagnose"},
            {"from": "diagnose", "to": "guardrail_check"},
            {"from": "guardrail_check", "to": "execute", "condition": "passed"},
            {"from": "guardrail_check", "to": "audit", "condition": "blocked"},
            {"from": "execute", "to": "audit"},
        ],
    }


@app.post("/agent/recover", response_model=RecoveryResponse)
async def run_recovery(req: RecoveryRequest):
    """
    Run the full LangGraph recovery agent workflow.
    This is the main endpoint that Next.js calls.
    """
    try:
        event_id = req.event_id or f"evt_{int(datetime.now().timestamp()*1000)}"
        thread_id = req.thread_id or f"thread_{event_id}"

        # Prepare initial state
        initial_state = {
            "event_id": event_id,
            "merchant_id": req.merchant_id,
            "event_type": req.event_type,
            "failure_code": req.failure_code,
            "amount": req.amount,
            "customer_name": req.customer_name,
            "customer_phone": req.customer_phone,
            "customer_email": req.customer_email,
            "language": req.language,
            "max_retries": req.max_retries,
            "min_voice_amount": req.min_voice_amount,
            "quiet_hours_start": req.quiet_hours_start,
            "quiet_hours_end": req.quiet_hours_end,
            "auto_halt_on_dnd": req.auto_halt_on_dnd,
            "voice_consent": req.voice_consent,
            # Initialize working memory
            "diagnosis": "",
            "risk_score": 0,
            "chosen_channel": "",
            "chosen_action": "",
            "explainability": "",
            "dialogue": "",
            "guardrail_passed": True,
            "guardrail_reason": "",
            "payment_link_url": "",
            "payment_link_id": "",
            "whatsapp_sent": False,
            "whatsapp_message": "",
            "voice_audio_base64": "",
            "voice_generated": False,
            "audit_log": "",
            "current_node": "",
            "agent_trace": [],
            "final_status": "",
        }

        # Run the LangGraph agent with thread configuration for persistence/resumption
        config = {"configurable": {"thread_id": thread_id}}
        final_state = await recovery_agent.ainvoke(initial_state, config=config)

        return RecoveryResponse(
            success=True,
            event_id=final_state.get("event_id", event_id),
            merchant_id=final_state.get("merchant_id", req.merchant_id),
            event_type=final_state.get("event_type", req.event_type),
            diagnosis=final_state.get("diagnosis", ""),
            action=final_state.get("chosen_action", ""),
            channel=final_state.get("chosen_channel", ""),
            risk_score=final_state.get("risk_score", 0),
            explainability=final_state.get("explainability", ""),
            dialogue=final_state.get("dialogue", ""),
            guardrail_passed=final_state.get("guardrail_passed", True),
            guardrail_reason=final_state.get("guardrail_reason", ""),
            payment_link_url=final_state.get("payment_link_url", ""),
            payment_link_id=final_state.get("payment_link_id", ""),
            whatsapp_sent=final_state.get("whatsapp_sent", False),
            whatsapp_message=final_state.get("whatsapp_message", ""),
            voice_generated=final_state.get("voice_generated", False),
            voice_audio_base64=final_state.get("voice_audio_base64", ""),
            final_status=final_state.get("final_status", "UNKNOWN"),
            audit_log=final_state.get("audit_log", ""),
            agent_trace=final_state.get("agent_trace", []),
            timestamp=datetime.now().isoformat(),
        )

    except Exception as e:
        print(f"[Agent Error] {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    print("[RevGuard] Starting LangGraph Agent on port 8000...")
    print("[Graph] detect -> diagnose -> guardrail_check -> execute -> audit")
    print("[Docs] http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)
