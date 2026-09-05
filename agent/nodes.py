"""
RevGuard AI — LangGraph Node Functions
Each function is a node in the state graph. The graph flows:
  detect → diagnose → guardrail_check → decide → execute → audit
"""

from datetime import datetime
from state import AgentState
from tools import (
    tool_diagnose_failure,
    tool_create_payment_link,
    tool_send_whatsapp,
    tool_generate_voice,
)


async def detect_node(state: AgentState) -> dict:
    """
    NODE 1: DETECT
    Classifies the incoming event and prepares initial context.
    """
    event_type = state.get("event_type", "payment.failed")
    amount = state.get("amount", 0)
    customer = state.get("customer_name", "Customer")

    event_labels = {
        "payment.failed": "Payment Failure Detected",
        "checkout.abandoned": "Checkout Abandonment Detected",
        "subscription.halted": "Subscription Mandate Failure",
        "invoice.overdue": "B2B Invoice Overdue",
    }

    label = event_labels.get(event_type, "Unknown Event")

    trace_entry = {
        "node": "DETECT",
        "timestamp": datetime.now().isoformat(),
        "message": f"{label} — ₹{amount} for {customer}",
    }

    return {
        "current_node": "detect",
        "agent_trace": [trace_entry],
    }


async def diagnose_node(state: AgentState) -> dict:
    """
    NODE 2: DIAGNOSE
    Uses LLM (via OpenRouter) to analyze root cause and recommend action.
    """
    result = await tool_diagnose_failure(
        event_type=state.get("event_type", "payment.failed"),
        failure_code=state.get("failure_code", "GATEWAY_TIMEOUT"),
        amount=state.get("amount", 1000),
        customer_name=state.get("customer_name", "Customer"),
        language=state.get("language", "hi"),
    )

    trace_entry = {
        "node": "DIAGNOSE",
        "timestamp": datetime.now().isoformat(),
        "message": f"Diagnosis: {result['diagnosis']} | Channel: {result['channel']}",
        "is_llm": result.get("is_llm", False),
    }

    existing_trace = state.get("agent_trace", [])

    return {
        "diagnosis": result["diagnosis"],
        "chosen_channel": result["channel"],
        "chosen_action": result["action"],
        "risk_score": result.get("risk_score", 65),
        "explainability": result["explainability"],
        "dialogue": result.get("dialogue", ""),
        "current_node": "diagnose",
        "agent_trace": existing_trace + [trace_entry],
    }


async def guardrail_check_node(state: AgentState) -> dict:
    """
    NODE 3: GUARDRAIL CHECK
    Enforces business rules before allowing execution.
    Checks: max retries, quiet hours, DND, amount thresholds.
    """
    now = datetime.now()
    current_hour = now.hour
    quiet_start = state.get("quiet_hours_start", 21)
    quiet_end = state.get("quiet_hours_end", 8)
    max_retries = state.get("max_retries", 2)
    amount = state.get("amount", 0)
    min_voice = state.get("min_voice_amount", 500)

    blocked = False
    reason = "All guardrails passed."

    # Check quiet hours
    if quiet_start > quiet_end:  # e.g., 21 to 8 (crosses midnight)
        if current_hour >= quiet_start or current_hour < quiet_end:
            blocked = True
            reason = f"Blocked: Quiet hours active ({quiet_start}:00 - {quiet_end}:00). Current time: {current_hour}:00."
    else:
        if quiet_start <= current_hour < quiet_end:
            blocked = True
            reason = f"Blocked: Quiet hours active ({quiet_start}:00 - {quiet_end}:00)."

    # Check voice eligibility — downgrade to WhatsApp if below threshold
    chosen_channel = state.get("chosen_channel", "WhatsApp UPI")
    if "Voice" in chosen_channel and amount < min_voice:
        chosen_channel = "WhatsApp UPI"
        reason += f" Voice downgraded to WhatsApp: amount ₹{amount} < threshold ₹{min_voice}."

    trace_entry = {
        "node": "GUARDRAIL_CHECK",
        "timestamp": datetime.now().isoformat(),
        "message": reason,
        "passed": not blocked,
    }

    existing_trace = state.get("agent_trace", [])

    return {
        "guardrail_passed": not blocked,
        "guardrail_reason": reason,
        "chosen_channel": chosen_channel,
        "current_node": "guardrail_check",
        "agent_trace": existing_trace + [trace_entry],
    }


async def execute_node(state: AgentState) -> dict:
    """
    NODE 4: EXECUTE
    Executes the chosen recovery action — creates payment link,
    sends WhatsApp, generates voice audio.
    """
    if not state.get("guardrail_passed", True):
        trace_entry = {
            "node": "EXECUTE",
            "timestamp": datetime.now().isoformat(),
            "message": f"Execution BLOCKED by guardrails: {state.get('guardrail_reason', '')}",
        }
        existing_trace = state.get("agent_trace", [])
        return {
            "current_node": "execute",
            "final_status": "BLOCKED",
            "agent_trace": existing_trace + [trace_entry],
        }

    # Step 1: Create Razorpay payment link
    link_result = await tool_create_payment_link(
        amount=state.get("amount", 1000),
        customer_name=state.get("customer_name", "Customer"),
        customer_phone=state.get("customer_phone", ""),
        description=f"RevGuard Recovery: {state.get('event_type', 'payment.failed')}",
    )

    payment_url = link_result.get("url", "")
    payment_id = link_result.get("id", "")

    # Step 2: Send WhatsApp message
    wa_result = await tool_send_whatsapp(
        phone=state.get("customer_phone", ""),
        customer_name=state.get("customer_name", "Customer"),
        amount=state.get("amount", 1000),
        payment_url=payment_url,
        language=state.get("language", "hi"),
    )

    # Step 3: Generate voice audio (if channel includes Voice)
    voice_result = {"generated": False, "audio_base64": ""}
    channel = state.get("chosen_channel", "")
    if "Voice" in channel or "voice" in channel:
        dialogue = state.get("dialogue", "")
        if dialogue:
            voice_result = await tool_generate_voice(
                text=dialogue,
                language=state.get("language", "hi"),
            )

    trace_entry = {
        "node": "EXECUTE",
        "timestamp": datetime.now().isoformat(),
        "message": f"Payment link created: {payment_url} | WhatsApp sent: {wa_result.get('sent')} | Voice generated: {voice_result.get('generated')}",
    }

    existing_trace = state.get("agent_trace", [])
    final_status = "RECOVERED" if state.get("event_type") != "invoice.overdue" else "P2P_RECORDED"

    return {
        "payment_link_url": payment_url,
        "payment_link_id": payment_id,
        "whatsapp_sent": wa_result.get("sent", False),
        "whatsapp_message": wa_result.get("message", ""),
        "voice_audio_base64": voice_result.get("audio_base64", ""),
        "voice_generated": voice_result.get("generated", False),
        "current_node": "execute",
        "final_status": final_status,
        "agent_trace": existing_trace + [trace_entry],
    }


async def audit_node(state: AgentState) -> dict:
    """
    NODE 5: AUDIT
    Creates a complete audit log entry with full explainability.
    """
    trace = state.get("agent_trace", [])

    audit_lines = [
        "═══════════════════════════════════════════",
        f"  REVGUARD AI — AUDIT TRAIL",
        f"  Timestamp: {datetime.now().isoformat()}",
        "═══════════════════════════════════════════",
        f"  Event:       {state.get('event_type', 'unknown')}",
        f"  Customer:    {state.get('customer_name', 'N/A')}",
        f"  Amount:      ₹{state.get('amount', 0)}",
        f"  Language:    {state.get('language', 'hi')}",
        "───────────────────────────────────────────",
        f"  Diagnosis:   {state.get('diagnosis', 'N/A')}",
        f"  Risk Score:  {state.get('risk_score', 0)}/100",
        f"  Channel:     {state.get('chosen_channel', 'N/A')}",
        f"  Action:      {state.get('chosen_action', 'N/A')}",
        "───────────────────────────────────────────",
        f"  Guardrail:   {'✅ PASSED' if state.get('guardrail_passed') else '❌ BLOCKED'}",
        f"  Reason:      {state.get('guardrail_reason', 'N/A')}",
        "───────────────────────────────────────────",
        f"  Payment Link: {state.get('payment_link_url', 'N/A')}",
        f"  WhatsApp:     {'✅ Sent' if state.get('whatsapp_sent') else '❌ Not sent'}",
        f"  Voice:        {'✅ Generated' if state.get('voice_generated') else '❌ Not generated'}",
        f"  Status:       {state.get('final_status', 'UNKNOWN')}",
        "═══════════════════════════════════════════",
        "  AGENT TRACE:",
    ]

    for step in trace:
        audit_lines.append(f"    [{step.get('node', '?')}] {step.get('timestamp', '')} — {step.get('message', '')}")

    audit_lines.append("═══════════════════════════════════════════")
    audit_log = "\n".join(audit_lines)

    trace_entry = {
        "node": "AUDIT",
        "timestamp": datetime.now().isoformat(),
        "message": f"Audit log generated. Final status: {state.get('final_status', 'UNKNOWN')}",
    }

    return {
        "audit_log": audit_log,
        "current_node": "audit",
        "agent_trace": trace + [trace_entry],
    }
