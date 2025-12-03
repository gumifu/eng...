# English Diary Corrector

Write daily English diary entries and get AI-powered corrections instantly.

## 機能

### MVP機能

- ✅ 日記の作成と保存
- ✅ AIによる即座の添削
- ✅ ミスの分類（冠詞、前置詞、時制など）
- ✅ CEFRレベル判定（A2/B1/B2など）
- ✅ 「今のレベル」と「1つ上のレベル」の2バージョンで添削
- ✅ 弱点分析ページ
- ✅ おすすめ勉強ポイントの表示

### 画面構成

1. **ホーム / ダッシュボード**
   - 今日の一言メッセージ
   - 連続記録日数
   - 最近の弱点TOP3
   - 「今日の日記を書く」ボタン

2. **日記を書く画面**
   - 日記の入力（タイトル、本文、気分）
   - 添削結果の表示
   - 1つ上のレベルでの書き直し
   - ミスのハイライトと解説

3. **弱点分析ページ**
   - エラー統計グラフ
   - 最近よく出るミスTOP3
   - 今日のおすすめ勉強ポイント
   - 例文とミニ練習問題

## 技術スタック

- **フロントエンド**: Next.js 16 (App Router), React 19, TypeScript
- **UI**: Tailwind CSS
- **AI**: OpenAI API (GPT-4o-mini)
- **データベース**: Prisma + SQLite (開発環境)

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env` ファイルを作成し、以下の環境変数を設定してください：

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OpenAI
OPENAI_API_KEY="your-openai-api-key-here"
```

### 3. データベースのセットアップ

```bash
# Prismaクライアントの生成（Node.jsのバージョンが古い場合はスキップ）
npx prisma generate

# データベースのマイグレーション（Node.jsのバージョンが古い場合はスキップ）
npx prisma migrate dev
```

**注意**: 現在のNode.jsバージョン（v20.6.0）では、Prismaの最新版がインストールできない可能性があります。その場合は、データベース機能は後で追加できます。

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## プロジェクト構造

```
.
├── app/
│   ├── api/
│   │   ├── correct/      # 添削API
│   │   ├── upgrade/       # 1つ上のレベルAPI
│   │   └── recommend/    # おすすめ勉強ポイントAPI
│   ├── write/            # 日記を書く画面
│   ├── weaknesses/       # 弱点分析ページ
│   ├── layout.tsx        # レイアウト（ナビゲーション含む）
│   └── page.tsx          # ホーム画面
├── lib/
│   ├── types.ts          # 型定義
│   └── utils.ts          # ユーティリティ関数
├── prisma/
│   └── schema.prisma     # データベーススキーマ
└── README.md
```

## APIエンドポイント

### POST /api/correct

日記を添削します。

**リクエスト:**
```json
{
  "text": "I go to school yesterday."
}
```

**レスポンス:**
```json
{
  "corrected_text": "I went to school yesterday.",
  "explanations": [
    {
      "original": "I go",
      "corrected": "I went",
      "reason_en": "Past tense is needed",
      "reason_ja": "過去形が必要です",
      "type": "tense"
    }
  ],
  "cefr_level": "A2",
  "error_summary": {
    "article": 0,
    "preposition": 0,
    "tense": 1,
    "word_order": 0,
    "vocabulary": 0,
    "spelling": 0,
    "other": 0
  }
}
```

### POST /api/upgrade

テキストを1つ上のレベルに書き直します。

**リクエスト:**
```json
{
  "text": "I went to school yesterday.",
  "currentLevel": "B1"
}
```

**レスポンス:**
```json
{
  "upgraded_text": "I attended school yesterday."
}
```

### POST /api/recommend

弱点に基づいておすすめ勉強ポイントを生成します。

**リクエスト:**
```json
{
  "errorSummary": {
    "article": 5,
    "preposition": 3,
    "tense": 1
  }
}
```

**レスポンス:**
```json
{
  "focus_point_ja": "冠詞の使い方を復習しましょう",
  "explanation_en": "Articles (a, an, the) are important for natural English.",
  "examples": ["I saw a cat.", "The cat was black.", "Cats are cute."],
  "practice_questions": [...]
}
```

## 今後の拡張機能

- [ ] ユーザー認証（NextAuth.js）
- [ ] データベースへの日記保存
- [ ] 日記の検索・フィルタリング
- [ ] グラフでの弱点可視化
- [ ] ダークモードの完全対応
- [ ] 日記のエクスポート機能

## ライセンス

MIT
# eng...
