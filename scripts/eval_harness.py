"""
RevGuard AI — Agent Evaluation Harness
Evaluates agent recovery accuracy, guardrail compliance, and response latency against a golden dataset.
"""

import sys
import os
import json
import time
import asyncio
from datetime import datetime

# Add parent directory to sys.path to import agent modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "agent"))

from graph import recovery_agent


async def run_evaluation():
    dataset_path = os.path.join(os.path.dirname(__file__), "..", "data", "golden_set.jsonl")
    if not os.path.exists(dataset_path):
        print(f"Error: Golden set not found at {dataset_path}")
        return

    with open(dataset_path, "r", encoding="utf-8") as f:
        cases = [json.loads(line.strip()) for line in f if line.strip()]

    print(f"\n=======================================================")
    print(f"   REVGUARD AI — EVALUATION HARNESS BENCHMARK")
    print(f"   Running {len(cases)} test cases against golden set...")
    print(f"=======================================================\n")

    passed_guardrails = 0
    channel_matches = 0
    total_latency_ms = 0.0
    results = []

    for i, case in enumerate(cases, 1):
        start_time = time.time()

        initial_state = {
            "event_id": f"eval_{case['id']}",
            "merchant_id": "merchant_eval",
            "event_type": case["event_type"],
            "failure_code": case.get("failure_code", "GATEWAY_TIMEOUT"),
            "amount": case.get("amount", 1000.0),
            "customer_name": case.get("customer_name", "Test User"),
            "customer_phone": "+919876543210",
            "customer_email": "eval@example.com",
            "language": case.get("language", "hi"),
            "max_retries": 2,
            "min_voice_amount": 500.0,
            "quiet_hours_start": 21,
            "quiet_hours_end": 8,
            "auto_halt_on_dnd": True,
            "voice_consent": case.get("voice_consent", True),
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

        config = {"configurable": {"thread_id": f"eval_thread_{case['id']}"}}
        final_state = await recovery_agent.ainvoke(initial_state, config=config)

        elapsed_ms = (time.time() - start_time) * 1000
        total_latency_ms += elapsed_ms

        guardrail_passed = final_state.get("guardrail_passed", False)
        if guardrail_passed == case.get("expected_guardrail", True):
            passed_guardrails += 1

        chosen_ch = final_state.get("chosen_channel", "")
        exp_ch = case.get("expected_channel", "")
        is_channel_match = exp_ch.lower() in chosen_ch.lower() or chosen_ch.lower() in exp_ch.lower()
        if is_channel_match:
            channel_matches += 1

        status_str = "PASS" if (guardrail_passed and is_channel_match) else "WARN"
        print(f"[{i}/{len(cases)}] {status_str} | ID: {case['id']} | Event: {case['event_type']} | Channel: {chosen_ch} | Latency: {elapsed_ms:.1f}ms")

        results.append({
            "id": case["id"],
            "event_type": case["event_type"],
            "expected_channel": exp_ch,
            "actual_channel": chosen_ch,
            "guardrail_passed": guardrail_passed,
            "latency_ms": elapsed_ms,
        })

    avg_latency = total_latency_ms / len(cases) if cases else 0
    guardrail_accuracy = (passed_guardrails / len(cases)) * 100 if cases else 0
    channel_accuracy = (channel_matches / len(cases)) * 100 if cases else 0

    print(f"\n=======================================================")
    print(f"   EVALUATION RESULTS SUMMARY")
    print(f"=======================================================")
    print(f"  Total Test Cases:    {len(cases)}")
    print(f"  Guardrail Compliance: {guardrail_accuracy:.1f}% ({passed_guardrails}/{len(cases)})")
    print(f"  Channel Accuracy:     {channel_accuracy:.1f}% ({channel_matches}/{len(cases)})")
    print(f"  Avg Agent Latency:    {avg_latency:.1f} ms")
    print(f"=======================================================\n")


if __name__ == "__main__":
    asyncio.run(run_evaluation())
