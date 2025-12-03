import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text, currentLevel } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    const levelMap: Record<string, string> = {
      A1: "A2",
      A2: "B1",
      B1: "B2",
      B2: "C1",
      C1: "C2",
    };

    const nextLevel = levelMap[currentLevel] || "B2";

    const prompt = `You are an English teacher.

The learner's current level is ${currentLevel || "B1"}.
Rewrite the same diary one level higher (to ${nextLevel} level):
- Use more natural and richer expressions.
- Keep the original meaning and tone.
- Do not make it too difficult.
- Make it sound more native and fluent.

Return only the upgraded diary text as plain text, no JSON, no explanations.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert English teacher. Rewrite texts to a higher CEFR level while maintaining the original meaning.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
    });

    const upgradedText = completion.choices[0]?.message?.content?.trim();

    if (!upgradedText) {
      throw new Error("No response from OpenAI");
    }

    return NextResponse.json({ upgraded_text: upgradedText });
  } catch (error) {
    console.error("Error in upgrade API:", error);

    // より詳細なエラーメッセージを返す
    let errorMessage = "Failed to upgrade text";
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;

      // OpenAI API関連のエラー
      if (errorMessage.includes("API key")) {
        errorMessage = "OpenAI APIキーが正しく設定されていません。.envファイルを確認してください。";
        statusCode = 500;
      } else if (errorMessage.includes("rate limit")) {
        errorMessage = "APIの利用制限に達しました。しばらく待ってから再試行してください。";
        statusCode = 429;
      } else if (errorMessage.includes("insufficient_quota")) {
        errorMessage = "OpenAI APIのクォータが不足しています。アカウントを確認してください。";
        statusCode = 402;
      }
    }

    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? error.stack : String(error) },
      { status: statusCode }
    );
  }
}

