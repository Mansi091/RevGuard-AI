"""
RevGuard AI — LangGraph Agent State Schema
Defines the shared state that flows through every node in the graph.
"""

from typing import TypedDict, Optional, Literal
from pydantic import BaseModel


class AgentState(TypedDict):
    """The state that flows through the LangGraph recovery agent."""

    # --- Input (from webhook/frontend) ---
    event_type: str              # payment.failed, checkout.abandoned, subscription.halted, invoice.overdue
    failure_code: str            # Razorpay error code e.g. INSUFFICIENT_FUNDS
    amount: float                # Transaction amount in INR
    customer_name: str
    customer_phone: str
    customer_email: str
    language: str                # hi, en, ta, te, kn, mr, bn, etc.

    # --- Guardrails Config ---
    max_retries: int
    min_voice_amount: float
    quiet_hours_start: int       # 20 = 8PM
    quiet_hours_end: int         # 8 = 8AM
    auto_halt_on_dnd: bool

    # --- Agent Working Memory (filled by nodes) ---
    diagnosis: str               # Root cause analysis
    risk_score: float            # 0-100 risk score
    chosen_channel: str          # WhatsApp, Voice, SMS, Smart Retry
    chosen_action: str           # What the agent decided to do
    explainability: str          # Why the agent chose this action
    dialogue: str                # Generated conversation script

    # --- Guardrail Check ---
    guardrail_passed: bool       # Did guardrail check pass?
    guardrail_reason: str        # Why blocked (if blocked)

    # --- Execution Results ---
    payment_link_url: str        # Razorpay payment link
    payment_link_id: str
    whatsapp_sent: bool
    whatsapp_message: str
    voice_audio_base64: str      # Sarvam AI audio
    voice_generated: bool

    # --- Audit ---
    audit_log: str               # Full audit trail
    current_node: str            # Which node is executing
    agent_trace: list            # List of all steps taken
    final_status: str            # RECOVERED, BLOCKED, FAILED, P2P_RECORDED
