# Firebase 設定ガイド

## 1. Firebase プロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: `english-diary-app`）
4. Google Analytics の設定（オプション）
5. プロジェクトを作成

## 2. Firestore データベースの設定

1. Firebase Console でプロジェクトを開く
2. 左メニューから「Firestore Database」を選択
3. 「データベースを作成」をクリック
4. セキュリティルールを選択：
   - **開発環境**: 「テストモードで開始」（後で本番用に変更）
   - **本番環境**: 「本番モードで開始」を推奨
5. ロケーションを選択（例: `asia-northeast1` - 東京）

## 3. Web アプリの登録

1. Firebase Console で「⚙️ プロジェクトの設定」をクリック
2. 「マイアプリ」セクションで「</>」アイコン（Web）をクリック
3. アプリのニックネームを入力（例: `English Diary Web`）
4. 「Firebase Hosting も設定する」はチェック不要（Next.js を使用するため）
5. 「アプリを登録」をクリック

## 4. 環境変数の設定

`.env.local`ファイルに以下の環境変数を追加：

```env
# Firebase (Firestore)
# ダブルクォートは必須ではありませんが、あっても問題ありません
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# または、ダブルクォート付きでもOK
# NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
```

これらの値は、Firebase Console の「プロジェクトの設定」→「全般」タブの「マイアプリ」セクションから取得できます。

## 5. Firestore セキュリティルール（開発環境）

開発環境では、以下のルールを設定してください：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 開発環境: 全員が読み書き可能（本番では変更が必要）
    match /entries/{entryId} {
      allow read, write: if true;
    }
  }
}
```

**重要**: 本番環境では、認証機能を追加して適切なセキュリティルールを設定してください。

## 6. サーバーサイド用の設定（オプション）

Firebase Admin SDK を使用する場合（現在の実装では使用しています）：

1. Firebase Console で「プロジェクトの設定」→「サービスアカウント」タブ
2. 「新しい秘密鍵の生成」をクリック
3. JSON ファイルがダウンロードされる
4. `.env.local`に追加（オプション）:

```env
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
```

または、環境変数から直接設定することもできます（現在の実装では`projectId`のみ使用）。

## 7. 動作確認

1. 開発サーバーを起動: `npm run dev`
2. 「日記を書く」ページで日記を入力
3. 「添削する」をクリック
4. 「保存」をクリック
5. ホームページで保存された日記が表示されることを確認

## トラブルシューティング

### エラー: "Firebase: Error (auth/configuration-not-found)"

- 環境変数が正しく設定されているか確認
- `.env.local`ファイルが存在するか確認
- サーバーを再起動

### エラー: "Permission denied"

- Firestore のセキュリティルールを確認
- 開発環境では「テストモード」を使用

### データが保存されない

- ブラウザのコンソールでエラーを確認
- Firestore Console でデータが保存されているか確認
