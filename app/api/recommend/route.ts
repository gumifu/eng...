import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { StudyRecommendation } from "@/lib/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { errorSummary } = await request.json();

    if (!errorSummary || typeof errorSummary !== "object") {
      return NextResponse.json(
        { error: "Error summary is required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 }
      );
    }

    const errorTypes = Object.entries(errorSummary)
      .filter(([_, count]) => (count as number) > 0)
      .map(([type, count]) => `- ${type}: ${count} times`)
      .join("\n");

    const prompt = `The learner often makes these mistakes:
${errorTypes}

Suggest:
1. Today's main focus point in Japanese (1 sentence).
2. A short explanation in simple English.
3. 3 example sentences at the learner's level.
4. 3 mini practice questions with 4 options each.

Output JSON in this format:
{
  "focus_point_ja": "...",
  "explanation_en": "...",
  "examples": ["...", "...", "..."],
  "practice_questions": [
    {
      "question": "...",
      "options": ["...", "...", "...", "..."],
      "correct_answer": 0
    }
  ]
}

Return only valid JSON, no markdown formatting.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert English teacher. Provide study recommendations based on common mistakes. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error("No response from OpenAI");
    }

    const recommendation: StudyRecommendation = JSON.parse(responseText);

    return NextResponse.json(recommendation);
  } catch (error) {
    console.error("Error in recommendation API:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendation" },
      { status: 500 }
    );
  }
}

