import { initializeApp, getApps, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// サーバーサイド用のFirebase Admin SDK
if (getApps().length === 0) {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      : null;

    if (serviceAccount) {
      // サービスアカウントキーが設定されている場合
      initializeApp({
        credential: cert(serviceAccount),
      });
    } else {
      // 開発環境: プロジェクトIDのみで初期化（認証なしで動作する場合）
      // 注意: 本番環境ではサービスアカウントキーが必要です
      initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "english-dialy-2c4b2",
      });
    }
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
    // フォールバック: プロジェクトIDのみで初期化
    initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "english-dialy-2c4b2",
    });
  }
}

export const adminDb = getFirestore();

