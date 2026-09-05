"""
RevGuard AI — Agent Tools
These are the tools the LLM agent can call during the recovery workflow.
Each tool wraps a real external API (Razorpay, Sarvam AI, Twilio).
"""

import os
import json
import httpx
import base64
from datetime import datetime


async def tool_diagnose_failure(event_type: str, failure_code: str, amount: float, customer_name: str, language: str = "hi") -> dict:
    """
    Uses OpenRouter LLM to diagnose the root cause of a payment failure.
    Returns diagnosis, recommended action, channel, and explainability.
    """
    openrouter_key = os.getenv("OPENROUTER_API_KEY", "")

    LANGUAGE_NAMES = {
        "hi": "Hindi (Hinglish)", "en": "English", "ta": "Tamil", "te": "Telugu",
        "kn": "Kannada", "mr": "Marathi", "bn": "Bengali", "gu": "Gujarati",
        "ml": "Malayalam", "pa": "Punjabi",
    }
    lang_name = LANGUAGE_NAMES.get(language, "Hindi (Hinglish)")

    prompt = f"""You are RevGuard AI, an expert Razorpay AI Revenue Recovery Agent.
Analyze this payment event and generate structured JSON recovery strategy.
Generate the "dialogue" field in {lang_name} language.

- Customer Name: {customer_name}
- Event Type: {event_type}
- Failure Reason Code: {failure_code}
- Amount: ₹{amount}
- Target Language: {lang_name}

Return ONLY valid raw JSON with keys:
"diagnosis": (1-sentence technical root cause in English),
"action": (recommended recovery action in English),
"channel": (WhatsApp UPI, Voice Call, Smart Retry, or SMS),
"risk_score": (0-100 integer, how likely revenue is permanently lost),
"explainability": (why this action was chosen, in English),
"dialogue": (3-sentence recovery call script in {lang_name})

No markdown, no backticks. JSON only."""

    if openrouter_key and openrouter_key.startswith("sk-or-v1-"):
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {openrouter_key}",
                        "HTTP-Referer": "https://razorpay.buildathon",
                        "X-Title": "RevGuard AI Agent",
                    },
                    json={
                        "model": "meta-llama/llama-3.3-70b-instruct:free",
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.2,
                    },
                )
                if resp.status_code == 200:
                    data = resp.json()
                    content = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
                    cleaned = content.replace("```json", "").replace("```", "").strip()
                    parsed = json.loads(cleaned)
                    return {
                        "diagnosis": parsed.get("diagnosis", "Payment failed during processing."),
                        "action": parsed.get("action", "Send recovery WhatsApp"),
                        "channel": parsed.get("channel", "WhatsApp UPI"),
                        "risk_score": parsed.get("risk_score", 65),
                        "explainability": parsed.get("explainability", "Standard recovery applied."),
                        "dialogue": parsed.get("dialogue", ""),
                        "is_llm": True,
                    }
        except Exception as e:
            print(f"[Tool:diagnose] LLM fallback: {e}")

    # Rule-based fallback
    diagnosis_map = {
        "INSUFFICIENT_FUNDS": "Card declined due to insufficient credit limit.",
        "BAD_REQUEST_PAYMENT_TIMED_OUT": "Bank OTP timeout or network failure during 3DS verification.",
        "GATEWAY_DOWNTIME": "Bank payment gateway is temporarily offline.",
        "BAD_REQUEST_PAYMENT_DECLINED": "Payment was declined by the issuing bank.",
    }
    return {
        "diagnosis": diagnosis_map.get(failure_code, "Transaction failed during authorization."),
        "action": "Send 1-Click Razorpay Payment Link via WhatsApp",
        "channel": "WhatsApp UPI",
        "risk_score": 70,
        "explainability": "Transient failure detected. Direct payment link bypasses standard cart flow.",
        "dialogue": f"Namaste {customer_name}! Aapka ₹{amount} ka payment pending hai. UPI link bhej doon?",
        "is_llm": False,
    }


async def tool_create_payment_link(amount: float, customer_name: str, customer_phone: str = "", description: str = "") -> dict:
    """
    Creates a Razorpay payment link using the Payment Links API.
    """
    rzp_key = os.getenv("RAZORPAY_KEY_ID", "")
    rzp_secret = os.getenv("RAZORPAY_KEY_SECRET", "")

    if rzp_key and rzp_secret and rzp_key.startswith("rzp_"):
        try:
            auth = base64.b64encode(f"{rzp_key}:{rzp_secret}".encode()).decode()
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(
                    "https://api.razorpay.com/v1/payment_links",
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Basic {auth}",
                    },
                    json={
                        "amount": int(amount * 100),
                        "currency": "INR",
                        "description": description or f"RevGuard Recovery for {customer_name}",
                        "customer": {
                            "name": customer_name,
                            "contact": customer_phone,
                        },
                        "reminder_enable": True,
                    },
                )
                if resp.status_code == 200:
                    data = resp.json()
                    return {
                        "url": data.get("short_url", ""),
                        "id": data.get("id", ""),
                        "is_live": True,
                    }
        except Exception as e:
            print(f"[Tool:payment_link] Error: {e}")

    # Sandbox fallback
    mock_id = f"plink_test_{int(datetime.now().timestamp())}"
    return {
        "url": f"https://rzp.io/rzp/test-{mock_id[-8:]}",
        "id": mock_id,
        "is_live": False,
    }


async def tool_send_whatsapp(phone: str, customer_name: str, amount: float, payment_url: str, language: str = "hi") -> dict:
    """
    Sends a WhatsApp recovery message via Twilio API.
    """
    WA_TEMPLATES = {
        "hi": "Namaste {name}! 🙏\nRazorpay RevGuard AI se reminder. Aapka ₹{amount} ka payment pending hai.\nInstant pay link: {url}",
        "en": "Hello {name}! 🙏\nReminder from RevGuard AI. Your ₹{amount} payment is pending.\nPay here: {url}",
        "ta": "வணக்கம் {name}! 🙏\nRevGuard AI நினைவூட்டல். ₹{amount} கட்டணம் நிலுவை.\nலிங்க்: {url}",
        "te": "నమస్కారం {name}! 🙏\nRevGuard AI రిమైండర్. ₹{amount} చెల్లింపు పెండింగ్.\nలింక్: {url}",
        "mr": "नमस्कार {name}! 🙏\nRevGuard AI रिमाइंडर. ₹{amount} पेमेंट पेंडिंग.\nलिंक: {url}",
        "kn": "ನಮಸ್ಕಾರ {name}! 🙏\nRevGuard AI ರಿಮೈಂಡರ್. ₹{amount} ಪಾವತಿ ಬಾಕಿ.\nಲಿಂಕ್: {url}",
        "bn": "নমস্কার {name}! 🙏\nRevGuard AI রিমাইন্ডার। ₹{amount} পেমেন্ট পেন্ডিং।\nলিংক: {url}",
    }

    template = WA_TEMPLATES.get(language, WA_TEMPLATES["hi"])
    message = template.format(name=customer_name, amount=amount, url=payment_url)

    sid = os.getenv("TWILIO_ACCOUNT_SID", "")
    token = os.getenv("TWILIO_AUTH_TOKEN", "")
    from_number = os.getenv("TWILIO_WHATSAPP_NUMBER", "whatsapp:+14155238886")

    formatted_to = phone.strip()
    if not formatted_to.startswith("whatsapp:"):
        if not formatted_to.startswith("+"):
            formatted_to = f"+91{formatted_to}"
        formatted_to = f"whatsapp:{formatted_to}"

    if sid and token and sid.startswith("AC"):
        try:
            auth = base64.b64encode(f"{sid}:{token}".encode()).decode()
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(
                    f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json",
                    headers={
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Authorization": f"Basic {auth}",
                    },
                    data=f"From={from_number}&To={formatted_to}&Body={message}",
                )
                if resp.status_code in (200, 201):
                    return {"sent": True, "to": formatted_to, "message": message, "real": True}
        except Exception as e:
            print(f"[Tool:whatsapp] Error: {e}")

    return {"sent": True, "to": formatted_to, "message": message, "real": False}


async def tool_generate_voice(text: str, language: str = "hi") -> dict:
    """
    Generates natural Indian voice audio using Sarvam AI Bulbul V3.
    Returns base64-encoded WAV audio.
    """
    sarvam_key = os.getenv("SARVAM_API_KEY", "")
    LANG_MAP = {
        "hi": "hi-IN", "en": "en-IN", "ta": "ta-IN", "te": "te-IN",
        "kn": "kn-IN", "mr": "mr-IN", "bn": "bn-IN", "gu": "gu-IN",
        "ml": "ml-IN", "pa": "pa-IN",
    }

    if not sarvam_key:
        return {"generated": False, "audio_base64": "", "error": "No SARVAM_API_KEY"}

    # Clean text
    import re
    clean_text = re.sub(r'[🤖👤]', '', text).replace("AI Voice:", "").replace("Customer:", "").strip()[:2400]

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                "https://api.sarvam.ai/text-to-speech",
                headers={
                    "api-subscription-key": sarvam_key,
                    "Content-Type": "application/json",
                },
                json={
                    "text": clean_text,
                    "language_code": LANG_MAP.get(language, "hi-IN"),
                    "speaker": "priya",
                    "model": "bulbul:v3",
                    "pace": 1.0,
                },
            )
            if resp.status_code == 200:
                data = resp.json()
                audios = data.get("audios", [])
                if audios:
                    return {"generated": True, "audio_base64": audios[0]}
    except Exception as e:
        print(f"[Tool:voice] Error: {e}")

    return {"generated": False, "audio_base64": "", "error": "Sarvam API failed"}
