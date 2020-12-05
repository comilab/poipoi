# poipoi

- クリエイター向けの画像・テキスト投稿アプリです
- 以下の機能があります:
  - 画像投稿
  - テキスト投稿
  - 投稿の公開範囲を設定（全体公開 / パスワード入力制 / 非公開）
  - 投稿のレーティングを設定（閲覧注意 / R-18）
  - 投稿の公開期間を設定
  - 投稿の検索避け設定
  - 投稿のピン留め（先頭に表示）
  - 投稿への絵文字によるリアクション追加（オンオフ設定可 / 絵文字設定可）
  - Twitterカード対応（オンオフ設定可）
  - RSS出力

## 動作環境

- Laravel8 および Nuxt2 を使用しているため、そちらの動作環境に準拠します
- 画像のリサイズにGDを使用しています

## インストール手順

- Releases より最新の poipoi.zip をDLし、そちらの README.txt をご参照ください

## 動作確認手順（開発用）

1. /php/.env.example を /php/.env にコピーする
2. database/database.sqlite を作成
3. 以下を実行

```sh
$ docker-compose up -f docker-compose.yml -f docker-compose.local.yml
$ docker-compose exec php php artisan key:generate
$ docker-compose exec php php artisan migrate --seed
$ docker-compose exec php php artisan storage:link
```

4. http://localhost:8080 にアクセス

初期ログイン情報は メールアドレス: admin@example.com / PW: password です
