import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

// 特定の日記を取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doc = await adminDb.collection("entries").doc(id).get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: "日記が見つかりません" },
        { status: 404 }
      );
    }

    const data = doc.data();
    return NextResponse.json({
      id: doc.id,
      ...data,
      date: data?.date?.toDate() || data?.date,
      createdAt: data?.createdAt?.toDate() || data?.createdAt,
      updatedAt: data?.updatedAt?.toDate() || data?.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching entry:", error);
    return NextResponse.json(
      { error: "日記の取得に失敗しました" },
      { status: 500 }
    );
  }
}

// 日記を更新
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    await adminDb.collection("entries").doc(id).update({
      ...data,
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating entry:", error);
    return NextResponse.json(
      { error: "日記の更新に失敗しました" },
      { status: 500 }
    );
  }
}

// 日記を削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await adminDb.collection("entries").doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting entry:", error);
    return NextResponse.json(
      { error: "日記の削除に失敗しました" },
      { status: 500 }
    );
  }
}

