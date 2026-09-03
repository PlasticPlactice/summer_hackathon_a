# summer_hackathon_a

センサーを用いた駐車状況を確認できるアプリ。

### db接続コマンド
```
mske db
```

### コンテナ起動
```
docker-compose up
```

### 実証用センサーの設定

現在のバックグラウンド監視はセンサー1台を対象とします。接続先や対象を変更する場合は、
コンテナ起動前に以下の環境変数を設定してください。未設定時は括弧内の値を使用します。

- `SENSOR_API_URL`（`http://192.168.120.238:3000/status`）
- `TARGET_SENSOR_ID`（`1`）
- `TARGET_DEVICE_ID`（`SENSOR_UP_001`）

監視処理は1秒ごとに状態を取得し、直近10回のうち3回以上検知された場合に使用中と判定します。

### 管理者認証API

管理系APIは、`POST /api/v1/auth/login` が発行するHttpOnly Cookieによる認証が必要です。
一般向けの駐車場参照APIとセンサーイベント受信APIは、ログインなしで利用できます。

開発環境の初期認証情報はユーザー名・パスワードともに `admin` です。本番環境では、
以下の環境変数を必ず安全な値へ変更してください。

- `ADMIN_USERNAME`: 管理者ユーザー名
- `ADMIN_PASSWORD_HASH`: `pbkdf2_sha256:反復回数:ソルト:ハッシュ値` 形式のパスワードハッシュ
- `AUTH_SECRET`: セッション署名用の十分に長いランダム文字列
- `AUTH_SESSION_TTL_SECONDS`: セッション有効期間（既定値は8時間）
- `AUTH_COOKIE_SECURE`: HTTPS環境では `true`
- `AUTHORIZATION_ENABLED`: 管理APIの認可を有効にする場合は `true`（既定値は `false`）

フロントエンドの認証対応が完了するまでは、`AUTHORIZATION_ENABLED=false` のまま管理APIを
認証なしで利用できます。認証・認可を有効にする環境では `true` を指定してください。
この設定は認可チェックだけを切り替えるため、`false` の場合でもログイン、ログアウト、
認証状態確認APIは利用できます。

ログイン後、フロントエンドから管理APIを呼ぶ際はCookieを送信するため、fetchに
`credentials: "include"` を指定します。認証状態は `GET /api/v1/auth/me`、ログアウトは
`POST /api/v1/auth/logout` で行えます。
