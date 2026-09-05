import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { transcript } = body;

    if (!transcript) {
      return NextResponse.json({ success: false, error: 'Transcript is required' }, { status: 400 });
    }

    let extractedDate = new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0]; // Default +5 days
    let extractedAmount = null;
    let intent = "PROMISE_TO_PAY";

    const openrouterKey = process.env.OPENROUTER_API_KEY;

    if (openrouterKey && openrouterKey.startsWith('sk-or-v1-')) {
      try {
        const prompt = `You are a voice parsing agent for Razorpay RevGuard AI.
Analyze this spoken Hinglish customer response and extract payment commitment details:
Spoken text: "${transcript}"
Current Year: 2026

Return ONLY valid raw JSON with keys:
"intent": ("PROMISE_TO_PAY", "DECLINED", or "INQUIRY"),
"extractedDate": (ISO date format YYYY-MM-DD for when customer promises to pay),
"extractedAmount": (number or null),
"summary": (1-sentence summary of what customer agreed to in English)

No markdown formatting, JSON only.`;

        const llmResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openrouterKey}`,
            'HTTP-Referer': 'https://razorpay.buildathon',
            'X-Title': 'RevGuard AI Voice Parser',
          },
          body: JSON.stringify({
            model: 'meta-llama/llama-3.3-70b-instruct:free',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.1,
          }),
        });

        if (llmResponse.ok) {
          const llmData = await llmResponse.json();
          const content = llmData?.choices?.[0]?.message?.content?.trim() || '';
          const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleaned);

          if (parsed.extractedDate) {
            extractedDate = parsed.extractedDate;
          }
          if (parsed.intent) {
            intent = parsed.intent;
          }
          return NextResponse.json({
            success: true,
            intent,
            extractedDate,
            summary: parsed.summary || `Parsed Promise-to-Pay date: ${extractedDate}`,
            transcript,
            isLlmParsed: true,
          });
        }
      } catch (err) {
        console.warn('Voice parser OpenRouter fallback:', err.message);
      }
    }

    // Heuristic fallback date parsing
    const lower = transcript.toLowerCase();
    if (lower.includes('september') || lower.includes('sep')) {
      const dayMatch = lower.match(/\b(\d{1,2})\b/);
      if (dayMatch) {
        const day = dayMatch[1].padStart(2, '0');
        extractedDate = `2026-09-${day}`;
      }
    }

    return NextResponse.json({
      success: true,
      intent,
      extractedDate,
      summary: `Parsed customer commitment date: ${extractedDate}`,
      transcript,
      isLlmParsed: false,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Voice parsing failed' },
      { status: 500 }
    );
  }
}
