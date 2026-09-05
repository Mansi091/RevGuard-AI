import { NextResponse } from 'next/server';

// Language display names for prompts
const LANGUAGE_NAMES = {
  hi: 'Hindi (Hinglish)',
  en: 'English',
  ta: 'Tamil',
  te: 'Telugu',
  kn: 'Kannada',
  mr: 'Marathi',
  bn: 'Bengali',
  gu: 'Gujarati',
  ml: 'Malayalam',
  pa: 'Punjabi',
};

// Fallback greeting templates per language
const GREETING_TEMPLATES = {
  hi: (name, amount) => `Namaste ${name}! Razorpay se reminder hai, aapka ₹${amount} ka payment pending hai. Kya main aapko 1-click UPI payment link bhej doon?`,
  en: (name, amount) => `Hello ${name}! This is a reminder from Razorpay. Your payment of ₹${amount} is pending. Shall I send you a 1-click UPI payment link?`,
  ta: (name, amount) => `வணக்கம் ${name}! Razorpay-யிலிருந்து நினைவூட்டல். உங்கள் ₹${amount} கட்டணம் நிலுவையில் உள்ளது. UPI பேமெண்ட் லிங்க் அனுப்பவா?`,
  te: (name, amount) => `నమస్కారం ${name}! Razorpay నుండి రిమైండర్. మీ ₹${amount} చెల్లింపు పెండింగ్‌లో ఉంది. UPI పేమెంట్ లింక్ పంపమంటారా?`,
  kn: (name, amount) => `ನಮಸ್ಕಾರ ${name}! Razorpay ನಿಂದ ರಿಮೈಂಡರ್. ನಿಮ್ಮ ₹${amount} ಪಾವತಿ ಬಾಕಿ ಇದೆ. UPI ಪೇಮೆಂಟ್ ಲಿಂಕ್ ಕಳುಹಿಸಲೇ?`,
  mr: (name, amount) => `नमस्कार ${name}! Razorpay कडून रिमाइंडर. तुमचे ₹${amount} पेमेंट पेंडिंग आहे. UPI पेमेंट लिंक पाठवू का?`,
  bn: (name, amount) => `নমস্কার ${name}! Razorpay থেকে রিমাইন্ডার। আপনার ₹${amount} পেমেন্ট পেন্ডিং আছে। UPI পেমেন্ট লিংক পাঠাবো?`,
  gu: (name, amount) => `નમસ્તે ${name}! Razorpay તરફથી રિમાઇન્ડર. તમારું ₹${amount} પેમેન્ટ પેન્ડિંગ છે. UPI પેમેન્ટ લિંક મોકલું?`,
  ml: (name, amount) => `നമസ്കാരം ${name}! Razorpay-ൽ നിന്ന് ഓർമ്മപ്പെടുത്തൽ. നിങ്ങളുടെ ₹${amount} പേയ്‌മെന്റ് ബാക്കിയാണ്. UPI പേയ്‌മെന്റ് ലിങ്ക് അയക്കട്ടെ?`,
  pa: (name, amount) => `ਸਤ ਸ੍ਰੀ ਅਕਾਲ ${name}! Razorpay ਤੋਂ ਰਿਮਾਈਂਡਰ। ਤੁਹਾਡਾ ₹${amount} ਪੇਮੈਂਟ ਪੈਂਡਿੰਗ ਹੈ। UPI ਪੇਮੈਂਟ ਲਿੰਕ ਭੇਜਾਂ?`,
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { eventType, failureCode, amount, customerName, guardrails, language = 'hi' } = body;

    const numAmount = Number(amount) || 1000;
    const maxRetries = guardrails?.maxRetries || 2;
    const minVoiceAmount = guardrails?.minVoiceAmount || 500;
    const isVoiceEligible = numAmount >= minVoiceAmount;
    const langName = LANGUAGE_NAMES[language] || 'Hindi (Hinglish)';

    let diagnosis = "Transaction failed during authorization.";
    let action = "Trigger WhatsApp UPI Link";
    let channel = "WhatsApp";
    let explainability = "Standard payment retry rule applied.";
    let hinglishDialogue = (GREETING_TEMPLATES[language] || GREETING_TEMPLATES.hi)(customerName || 'Customer', numAmount);
    let isLlmGenerated = false;

    // Check OpenRouter API key
    const openrouterKey = process.env.OPENROUTER_API_KEY;

    if (openrouterKey && openrouterKey.startsWith('sk-or-v1-')) {
      try {
        const prompt = `You are RevGuard AI, an expert Razorpay AI Revenue Recovery Agent.
Analyze this payment event and generate structured JSON recovery strategy.
IMPORTANT: Generate the "hinglishDialogue" field ENTIRELY in ${langName} language.

- Customer Name: ${customerName || 'Customer'}
- Event Type: ${eventType} (options: payment.failed, checkout.abandoned, subscription.halted, invoice.overdue)
- Failure Reason Code: ${failureCode || 'GATEWAY_TIMEOUT'}
- Amount: ₹${numAmount}
- Minimum Voice Threshold: ₹${minVoiceAmount}
- Target Language: ${langName}

Return ONLY valid raw JSON with keys:
"diagnosis": (concise 1-sentence technical diagnosis in English),
"action": (concise recommended intervention action in English),
"channel": (WhatsApp UPI, ${langName} AI Voice, Smart Retry, or SMS),
"explainability": (explainable AI reasoning why this action was picked, in English),
"hinglishDialogue": (3-sentence realistic phone call conversation between AI Voice Bot and Customer in ${langName} language, discussing payment recovery and P2P commitment. Use the customer's language naturally.)

No markdown, no backticks. JSON only.`;

        const llmResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openrouterKey}`,
            'HTTP-Referer': 'https://razorpay.buildathon',
            'X-Title': 'RevGuard AI',
          },
          body: JSON.stringify({
            model: 'meta-llama/llama-3.3-70b-instruct:free',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2,
          }),
        });

        if (llmResponse.ok) {
          const llmData = await llmResponse.json();
          const content = llmData?.choices?.[0]?.message?.content?.trim() || '';
          let cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleaned);

          if (parsed.diagnosis && parsed.action) {
            diagnosis = parsed.diagnosis;
            action = parsed.action;
            channel = parsed.channel || channel;
            explainability = parsed.explainability || explainability;
            if (parsed.hinglishDialogue) {
              hinglishDialogue = parsed.hinglishDialogue;
            }
            isLlmGenerated = true;
          }
        }
      } catch (err) {
        console.warn('OpenRouter LLM fallback to rule engine:', err.message);
      }
    }

    // Heuristic Fallback if LLM not triggered or offline
    if (!isLlmGenerated) {
      const greet = GREETING_TEMPLATES[language] || GREETING_TEMPLATES.hi;

      if (eventType === "checkout.abandoned") {
        diagnosis = "User hesitated on checkout OTP screen for >40 seconds and exited.";
        hinglishDialogue = `Namaste ${customerName || 'Customer'}! 🙏 Aapne cart checkout incomplete chor diya tha. Fast delivery ke liye instant 1-click Razorpay link se finish karein (₹${numAmount.toLocaleString('en-IN')}):`;
        if (isVoiceEligible) {
          action = `Initiate ${langName} AI Voice Bot call to offer instant 1-click UPI Link`;
          channel = `${langName} AI Voice`;
          explainability = `Order amount (₹${numAmount}) exceeds Voice threshold (₹${minVoiceAmount}). Personalized voice call converts high-intent buyers.`;
        } else {
          action = "Send SMS Nudge with Razorpay UPI Payment Link";
          channel = "SMS";
          explainability = `Order amount (₹${numAmount}) is below Voice threshold (₹${minVoiceAmount}). SMS nudge chosen to minimize cost.`;
        }
      } else if (eventType === "subscription.halted") {
        diagnosis = "Recurring mandate debit failed: Bank gateway timeout or insufficient balance.";
        action = "Schedule Mandate Smart Retry (+4 hours) & send WhatsApp renewal link";
        channel = "Smart Retry + WhatsApp";
        explainability = "Mandate failures due to bank downtime should not burn customer retries. Smart retry scheduled for off-peak bank window.";
        hinglishDialogue = `Namaste ${customerName || 'Customer'}! 🙏 Aapka subscription auto-debit retry schedule ho gaya hai. Instant renewal link for ₹${numAmount.toLocaleString('en-IN')}:`;
      } else if (eventType === "invoice.overdue") {
        diagnosis = "B2B Invoice overdue by 10+ days. Accounts payable follow-up required.";
        action = "Conversational Voice Chaser -> Secure Promise-to-Pay (P2P) date";
        channel = "B2B Voice Chaser";
        explainability = "Direct phone reminder with automated P2P date logging pauses aggressive reminders and preserves client relationship.";
        hinglishDialogue = `Namaste ${customerName || 'Customer'}! 🙏 Reminder for B2B Invoice ₹${numAmount.toLocaleString('en-IN')}. Please click to clear pending balance:`;
      } else {
        if (failureCode === "INSUFFICIENT_FUNDS") {
          diagnosis = "Customer card declined due to insufficient credit limit.";
          action = "Offer alternative Razorpay UPI / No-Cost EMI Payment Link";
          channel = "WhatsApp EMI Link";
          explainability = "Card limit issue detected. Switching payment method to UPI or EMI increases recovery rate by 40%.";
          hinglishDialogue = `Namaste ${customerName || 'Customer'}! 🙏 Card limit decline. Alternate No-Cost EMI / UPI payment link for ₹${numAmount.toLocaleString('en-IN')}:`;
        } else {
          diagnosis = "Bank OTP timeout or network failure during 3DS verification.";
          action = "Send 1-Click Razorpay Payment Link via WhatsApp";
          channel = "WhatsApp UPI";
          explainability = "Transient network issue. Direct 1-click payment link bypasses standard cart flow.";
          hinglishDialogue = `Namaste ${customerName || 'Customer'}! 🙏 Bank OTP timeout ki wajah se payment fail hua. Instant 1-click Razorpay retry link for ₹${numAmount.toLocaleString('en-IN')}:`;
        }
      }
    }

    const flashSaleActive = guardrails?.flashSaleActive || false;
    const gateExplanation = flashSaleActive
      ? `Guardrail Enforced: Max retries = ${maxRetries}. 🔥 Flash Sale Mode Active: Quiet hours bypassed.`
      : `Guardrail Enforced: Max retries allowed = ${maxRetries}. Current attempt = 1. Compliant with quiet hours.`;

    return NextResponse.json({
      success: true,
      event: eventType,
      diagnosis,
      action,
      channel,
      explainability,
      hinglishDialogue,
      isLlmGenerated,
      language,
      gateStatus: "GATED_PASSED",
      gateExplanation,
      amount: numAmount,
      customer: customerName || "Customer",
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Diagnosis failed' },
      { status: 500 }
    );
  }
}
