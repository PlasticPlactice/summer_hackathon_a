# Park Now

センサーを用いた駐車状況を確認できるアプリ。

## 概要

高速道路のSA/PA（サービスエリア・パーキングエリア）などを対象に、駐車スペースに設置した
センサーの検知情報をリアルタイムに集約し、Web上で駐車場の空き状況を確認できるようにする
システム。一般利用者向けの空き状況確認画面と、駐車場・駐車枠・センサーを管理するための
管理者向け画面を提供する。

## 主な機能

### 一般利用者向け

- **駐車場一覧表示**（`/parkList`）: 登録済み駐車場ごとの空き状況（空き台数/満車台数）を一覧表示
- **駐車場詳細表示**（`/parkInfo`）: 駐車場マップ上に普通車・大型車の駐車枠を表示し、枠ごとの
  空き/使用中状態を確認可能。レイアウト未設定の駐車場は、登録済み写真上に検出結果を
  オーバーレイ表示するモードにフォールバックする

### 管理者向け（`/admin` 配下、要ログイン）

- **駐車場管理**: 駐車場の新規登録・編集・削除、収容台数（普通車/大型車）の管理
- **駐車場画像登録＋自動検出**: 駐車場の写真をアップロードすると、YOLO（`ultralytics`）による
  物体検出で駐車枠の座標・種別（普通車/大型車）を自動検出し、検出台数を収容台数へ自動入力。
  レイアウトが未整備の駐車場でも写真ベースで素早く登録できる
- **センサー管理**: センサーの個別登録・連番一括登録、駐車枠とセンサーの紐付け変更
- **認証**: `POST /api/v1/auth/login` で発行されるHttpOnly Cookieによるセッション認証

### センサー連携・状態判定

- バックグラウンドタスクが1秒間隔で対象センサーの状態を取得
- 直近10回（10秒間）の検知履歴のうち3回以上検知された場合に「使用中」と判定し、
  人や動物などによる一瞬の誤検知を除外するノイズフィルタを実装
- センサーの状態変化は、紐付けられた駐車枠（`parking_spaces`）へ自動反映される

## システム構成

```
[ センサー ] --HTTP--> [ backend(FastAPI) ] <---> [ db(PostgreSQL) ]
                              ^
                              | REST API
                              v
                     [ frontend(Next.js) ] <--- ブラウザ
```

| レイヤー | 技術スタック |
| --- | --- |
| フロントエンド | Next.js 16 / React 19 / TypeScript / Tailwind CSS |
| バックエンド | FastAPI / SQLAlchemy 2.0 / Pydantic |
| データベース | PostgreSQL 16 |
| 物体検出 | Ultralytics YOLO（駐車枠自動検出） |
| インフラ | Docker Compose（db / backend / frontend の3コンテナ構成） |

## ディレクトリ構成（抜粋）

```
backend/
  app/
    api/routes/    # parkings, spaces, sensors, sensor_response, auth などのAPIルーター
    core/          # 設定(config)・認証(auth)
    db/            # DBセッション・Baseモデル
    models/        # parkings, sensors, parking_spaces のORMモデル
    schemas/       # リクエスト/レスポンスのPydanticスキーマ
  services/
    parking_detector.py  # YOLOによる駐車枠検出
    sensor_monitor.py    # センサー状態のバックグラウンド監視・判定
    image_service.py     # 駐車場画像の保存・管理
frontend/
  src/app/
    parkList/ parkInfo/      # 一般向け画面
    admin/                   # 管理者向け画面（駐車場・センサー・画像登録 等）
    component/               # 駐車場マップ・一覧・センサー管理などのUIコンポーネント
docker/
  schema.sql, init-db.sql    # DBスキーマ・初期データ
```

## セットアップ

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

- `SENSOR_API_URL`（`提供されるセンサーのURL`）
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

ログイン後、フロントエンドから管理APIを呼ぶ際はCookieを送信するため、fetchに
`credentials: "include"` を指定します。認証状態は `GET /api/v1/auth/me`、ログアウトは
`POST /api/v1/auth/logout` で行えます。

## 主なAPIエンドポイント（`/api/v1` 配下）

| メソッド | パス | 概要 | 認証 |
| --- | --- | --- | --- |
| GET | `/parkings` | 全駐車場の現在状況（空き/使用中台数、枠一覧）を取得 | 不要 |
| GET | `/parkings/{id}` | 指定駐車場の現在状況を取得 | 不要 |
| POST | `/parkings` | 駐車場を新規登録（画像アップロード時はYOLOで枠を自動生成） | 必要 |
| POST | `/parkings/preview` | 画像をアップロードし、YOLO検出結果をプレビュー | 必要 |
| PUT / DELETE | `/parkings/{id}` | 駐車場の更新・削除 | 必要 |
| GET / POST | `/spaces` | 駐車枠の一覧取得・新規登録 | 必要 |
| PATCH | `/spaces/{id}/status` | 駐車枠のステータス変更 | 必要 |
| PUT | `/spaces/{id}/sensor` | 駐車枠とセンサーの紐付け変更 | 必要 |
| GET / POST | `/sensors`, `/sensors/batch` | センサーの一覧取得・登録・一括登録 | 必要 |
| GET | `/sensor-response` | 実証用センサーAPIの疎通確認 | 不要 |
| POST | `/auth/login` / `/auth/logout` | 管理者ログイン・ログアウト | - |
| GET | `/auth/me` | 認証状態の確認 | 必要 |
