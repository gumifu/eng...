import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    // Firestoreへの接続テスト
    const testDoc = await adminDb.collection("_test").doc("connection").get();

    return NextResponse.json({
      success: true,
      message: "Firebase接続成功",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      hasConfig: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  } catch (error) {
    console.error("Firebase connection error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      },
      { status: 500 }
    );
  }
}





