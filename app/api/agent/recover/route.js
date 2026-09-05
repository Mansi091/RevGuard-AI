import { NextResponse } from 'next/server';

/**
 * Proxy route that forwards recovery requests to the Python LangGraph agent.
 * Next.js frontend calls /api/agent/recover → this forwards to Python FastAPI at :8000
 */
export async function POST(request) {
  try {
    const body = await request.json();

    const agentRes = await fetch('http://localhost:8000/agent/recover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!agentRes.ok) {
      const errorText = await agentRes.text();
      console.error('LangGraph agent error:', agentRes.status, errorText);
      return NextResponse.json(
        { success: false, error: `Agent error: ${agentRes.status}`, fallback: true },
        { status: 500 }
      );
    }

    const agentData = await agentRes.json();
    return NextResponse.json(agentData);
  } catch (error) {
    console.error('Agent proxy error:', error.message);
    // Return fallback flag so frontend can use the old diagnose API
    return NextResponse.json(
      { success: false, error: error.message, fallback: true },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const res = await fetch('http://localhost:8000/agent/health');
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ status: 'offline', error: 'LangGraph agent not running' });
  }
}
