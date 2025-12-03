import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { CorrectionResponse } from "@/lib/types";

// 環境変数からAPIキーを取得（短いキーの場合は後でエラーを返す）
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.length < 50 || !apiKey.startsWith("sk-proj-")) {
    return null;
  }
  return new OpenAI({ apiKey });
};

const openai = getOpenAIClient();

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    // デバッグ: 環境変数の確認（本番環境では削除）
    if (process.env.NODE_ENV === "development") {
      console.log("OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY);
      console.log("OPENAI_API_KEY length:", process.env.OPENAI_API_KEY?.length || 0);
      console.log("OPENAI_API_KEY prefix:", process.env.OPENAI_API_KEY?.substring(0, 10) || "not set");
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set in environment variables");
      return NextResponse.json(
        { error: "OpenAI API key is not configured. Please check your .env file and restart the server." },
        { status: 500 }
      );
    }

    // システム環境変数が短いキー（間違ったキー）で上書きされている可能性をチェック
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey.length < 50 || !apiKey.startsWith("sk-proj-")) {
      console.error("Invalid API key detected. Length:", apiKey.length, "Prefix:", apiKey.substring(0, 10));
      return NextResponse.json(
        {
          error: "OpenAI APIキーが正しく設定されていません。システム環境変数が.envファイルの値を上書きしている可能性があります。\n\n解決方法:\n1. ターミナルで 'unset OPENAI_API_KEY' を実行\n2. 開発サーバーを再起動\n3. または、.env.localファイルに正しいAPIキーを設定",
          details: `現在のキーの長さ: ${apiKey.length}文字（正しいキーは200文字以上）`
        },
        { status: 500 }
      );
    }

    const prompt = `You are an English teacher correcting a Japanese learner's English diary.

1. Correct the text to CEFR B1 level, keeping the learner's style and meaning.
2. Explain the main mistakes in simple English and short Japanese.
3. Classify each mistake into categories: article, preposition, tense, word_order, vocabulary, spelling, other.
4. Estimate the learner's CEFR level for this text (A2, B1, or B2).

Output JSON in this format:
{
  "corrected_text": "...",
  "explanations": [
    {
      "original": "...",
      "corrected": "...",
      "reason_en": "...",
      "reason_ja": "...",
      "type": "article"
    }
  ],
  "cefr_level": "B1",
  "error_summary": {
    "article": 2,
    "preposition": 1,
    "tense": 0,
    "word_order": 1,
    "vocabulary": 0,
    "spelling": 0,
    "other": 0
  },
  "comment": "Brief comment about the overall writing level in Japanese"
}

Text to correct:
${text}

Return only valid JSON, no markdown formatting.`;

    if (!openai) {
      return NextResponse.json(
        {
          error: "OpenAI APIキーが正しく設定されていません。システム環境変数が.envファイルの値を上書きしている可能性があります。",
          details: "解決方法: ターミナルで 'unset OPENAI_API_KEY' を実行してから、開発サーバーを再起動してください。"
        },
        { status: 500 }
      );
    }

    // API呼び出し前にログを出力
    if (process.env.NODE_ENV === "development") {
      console.log("Calling OpenAI API with model: gpt-4o-mini");
      console.log("Text length:", text.length);
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert English teacher specializing in correcting Japanese learners' English. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    if (process.env.NODE_ENV === "development") {
      console.log("OpenAI API response received");
      console.log("Usage:", completion.usage);
    }

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error("No response from OpenAI");
    }

    const correction: CorrectionResponse = JSON.parse(responseText);

    return NextResponse.json(correction);
  } catch (error) {
    console.error("Error in correction API:", error);
    console.error("Error type:", error?.constructor?.name);
    console.error("Error message:", error instanceof Error ? error.message : String(error));

    // より詳細なエラーメッセージを返す
    let errorMessage = "添削中にエラーが発生しました";
    let statusCode = 500;
    let details = "";

    if (error instanceof Error) {
      const originalMessage = error.message;
      details = originalMessage;

      // OpenAI API関連のエラー（より詳細にチェック）
      if (originalMessage.includes("API key") || originalMessage.includes("Invalid API key") || originalMessage.includes("Incorrect API key")) {
        errorMessage = "OpenAI APIキーが正しく設定されていません。.envファイルを確認してください。";
        statusCode = 401;
      } else if (originalMessage.includes("rate limit") || originalMessage.includes("429") || originalMessage.includes("Rate limit")) {
        errorMessage = "APIの利用制限に達しました。しばらく待ってから再試行してください。";
        statusCode = 429;
      } else if (originalMessage.includes("insufficient_quota") || originalMessage.includes("quota") || originalMessage.includes("exceeded") || originalMessage.includes("billing")) {
        errorMessage = "OpenAI APIのクォータが不足しています。\n\n無料プランでも使用できますが、以下のいずれかが必要です：\n1. 支払い方法を設定（Free tierでも必要）\n   → https://platform.openai.com/account/billing\n2. クレジットを追加（$5以上使用すると次のtierに自動移行）\n   → https://platform.openai.com/account/billing\n\n※ Free tierでも初回使用時に支払い方法の設定が必要な場合があります。";
        statusCode = 402;
      } else if (originalMessage.includes("401") || originalMessage.includes("Unauthorized")) {
        errorMessage = "OpenAI APIキーが無効です。正しいAPIキーを設定してください。";
        statusCode = 401;
      } else if (originalMessage.includes("model") || originalMessage.includes("gpt-4o-mini")) {
        errorMessage = `モデルの指定に問題があります: ${originalMessage}\n\n利用可能なモデルを確認してください。`;
        statusCode = 400;
      } else {
        errorMessage = `添削中にエラーが発生しました: ${originalMessage}`;
      }
    } else if (typeof error === "object" && error !== null) {
      // OpenAI SDKのエラーオブジェクトの場合
      const errorObj = error as any;
      if (errorObj.status) {
        statusCode = errorObj.status;
      }
      if (errorObj.message) {
        details = errorObj.message;
        errorMessage = `OpenAI APIエラー: ${errorObj.message}`;
      }
      if (errorObj.code) {
        details += ` (Code: ${errorObj.code})`;
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: details,
        statusCode: statusCode,
        originalError: process.env.NODE_ENV === "development" ? String(error) : undefined
      },
      { status: statusCode }
    );
  }
}

