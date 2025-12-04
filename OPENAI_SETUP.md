# OpenAI API設定ガイド

## 1. APIキーの取得

1. [OpenAI Platform](https://platform.openai.com/)にアクセス
2. ログイン（アカウントがない場合は作成）
3. 右上のプロフィールアイコン → 「API keys」をクリック
4. 「Create new secret key」をクリック
5. キー名を入力（例: "English Diary App"）
6. 「Create secret key」をクリック
7. **重要**: キーが表示されたら、すぐにコピーしてください（後で表示されません）

## 2. 環境変数の設定

`.env.local`ファイルに以下を追加：

```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**注意**:
- ダブルクォートは不要です
- `sk-proj-`で始まる長い文字列（200文字程度）です

## 3. 支払い方法の設定（必須）

OpenAI APIを使用するには、**支払い方法の設定が必要**です：

1. [OpenAI Platform](https://platform.openai.com/account/billing)にアクセス
2. 「Payment methods」セクションで「Add payment method」をクリック
3. クレジットカードなどの支払い方法を追加
4. 必要に応じてクレジットを追加

### Free Tierについて

- Free tierでも使用可能ですが、**初回使用時に支払い方法の設定が必要**です
- $5以上使用すると、自動的に「Usage tier 1」に移行し、制限が緩和されます

## 4. 動作確認

設定後、以下を確認：

1. 開発サーバーを再起動：
   ```bash
   # サーバーを停止（Ctrl+C）
   npm run dev
   ```

2. ブラウザで http://localhost:3000/write にアクセス

3. 日記を入力して「添削する」をクリック

4. エラーが発生する場合：
   - ブラウザのコンソール（F12）でエラーメッセージを確認
   - ターミナルのログを確認

## よくあるエラーと解決方法

### エラー: "429 You exceeded your current quota"

**原因**: クォータ不足または支払い方法未設定

**解決方法**:
1. https://platform.openai.com/account/billing にアクセス
2. 支払い方法を追加
3. クレジットを追加（必要に応じて）

### エラー: "401 Invalid API key"

**原因**: APIキーが正しく設定されていない

**解決方法**:
1. `.env.local`ファイルで`OPENAI_API_KEY`が正しく設定されているか確認
2. APIキーが`sk-proj-`で始まる長い文字列（200文字程度）か確認
3. サーバーを再起動

### エラー: "API key is not configured"

**原因**: 環境変数が読み込まれていない

**解決方法**:
1. `.env.local`ファイルがプロジェクトルートにあるか確認
2. 環境変数名が`OPENAI_API_KEY`（`NEXT_PUBLIC_`プレフィックスなし）か確認
3. サーバーを再起動

## 使用モデル

現在のアプリでは以下のモデルを使用しています：

- **添削**: `gpt-4o-mini`（コスト効率が良い）
- **1つ上のレベル**: `gpt-4o-mini`（同じモデルで書き直し）

必要に応じて、`app/api/correct/route.ts`と`app/api/upgrade/route.ts`でモデルを変更できます。

## コスト目安

- `gpt-4o-mini`: 1回の添削あたり約$0.001-0.01（テキストの長さによる）
- 1日10回添削した場合: 約$0.01-0.10/日

詳細は[OpenAI Pricing](https://openai.com/api/pricing/)を確認してください。


