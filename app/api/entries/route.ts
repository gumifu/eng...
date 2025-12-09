import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { Entry } from "@/lib/types";

// 日記を保存
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { title, originalText, correctedText, upgradedText, cefrLevel, mood, errorSummary } = data;

    if (!originalText) {
      return NextResponse.json(
        { error: "本文は必須です" },
        { status: 400 }
      );
    }

    // TODO: 認証機能を追加したら、userIdを取得
    const userId = "anonymous"; // 一時的に匿名ユーザー

    const entryData = {
      userId,
      date: new Date(),
      title: title || null,
      originalText,
      correctedText: correctedText || null,
      upgradedText: upgradedText || null,
      cefrLevel: cefrLevel || null,
      mood: mood || null,
      errorSummary: errorSummary || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await adminDb.collection("entries").add(entryData);

    return NextResponse.json({
      id: docRef.id,
      ...entryData,
    });
  } catch (error) {
    console.error("Error saving entry:", error);
    return NextResponse.json(
      { error: "日記の保存に失敗しました" },
      { status: 500 }
    );
  }
}

// 日記一覧を取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "anonymous"; // 一時的に匿名ユーザー
    const limit = parseInt(searchParams.get("limit") || "10");

    const entriesRef = adminDb.collection("entries")
      .where("userId", "==", userId)
      .orderBy("date", "desc")
      .limit(limit);

    const snapshot = await entriesRef.get();
    const entries = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate() || doc.data().date,
      createdAt: doc.data().createdAt?.toDate() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate() || doc.data().updatedAt,
    }));

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Error fetching entries:", error);
    return NextResponse.json(
      { error: "日記の取得に失敗しました" },
      { status: 500 }
    );
  }
}





