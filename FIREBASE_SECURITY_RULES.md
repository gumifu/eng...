# Firestoreセキュリティルール設定

## 開発環境用のセキュリティルール

Firebase Consoleで、Firestore Database → ルール に以下のルールを設定してください：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 開発環境: 全員が読み書き可能
    // 本番環境では認証機能を追加して適切なルールを設定してください
    match /entries/{entryId} {
      allow read, write: if true;
    }

    // テスト用コレクション
    match /_test/{document=**} {
      allow read, write: if true;
    }
  }
}
```

## 設定手順

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. プロジェクトを選択
3. 左メニューから「Firestore Database」を選択
4. 「ルール」タブをクリック
5. 上記のルールをコピー＆ペースト
6. 「公開」をクリック

## 注意事項

⚠️ **このルールは開発環境専用です**

本番環境では、以下のように認証機能を追加してください：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /entries/{entryId} {
      // 認証済みユーザーのみが自分の日記を読み書き可能
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```





