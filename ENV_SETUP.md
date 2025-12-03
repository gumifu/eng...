# 環境変数の設定

`.env` ファイルをプロジェクトルートに作成し、以下の環境変数を設定してください：

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OpenAI
OPENAI_API_KEY="your-openai-api-key-here"

# Firebase (Firestore)
NEXT_PUBLIC_FIREBASE_API_KEY="your-firebase-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"

# Firebase Admin (サーバーサイド用、オプション)
# FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
```

## 環境変数の説明

- `DATABASE_URL`: SQLiteデータベースのパス（開発環境）
- `NEXTAUTH_URL`: アプリケーションのURL
- `NEXTAUTH_SECRET`: NextAuth.js用のシークレットキー（ランダムな文字列を生成）
- `OPENAI_API_KEY`: OpenAI APIのキー（[OpenAI Platform](https://platform.openai.com/)で取得）

## NEXTAUTH_SECRETの生成方法

以下のコマンドでランダムなシークレットを生成できます：

```bash
openssl rand -base64 32
```

または、Node.jsを使用：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

