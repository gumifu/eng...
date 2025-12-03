import { NextResponse } from "next/server";

export async function GET() {
  const hasApiKey = !!process.env.OPENAI_API_KEY;
  const apiKeyLength = process.env.OPENAI_API_KEY?.length || 0;
  const apiKeyPrefix = process.env.OPENAI_API_KEY?.substring(0, 7) || "not set";

  return NextResponse.json({
    hasApiKey,
    apiKeyLength,
    apiKeyPrefix: hasApiKey ? `${apiKeyPrefix}...` : "not set",
    nodeEnv: process.env.NODE_ENV,
    // セキュリティのため、実際のキーは返さない
  });
}

