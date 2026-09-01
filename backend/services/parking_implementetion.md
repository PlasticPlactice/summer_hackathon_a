# 駐車場登録機能 実装計画書

## 1. 目的

駐車場登録時に画像をアップロードし、YOLOを利用して画像内の駐車スペースを自動検出する。

検出結果をフロントエンド上に表示し、ユーザーが内容を確認・修正したうえで登録を確定する。

登録確定後は、駐車場の画像と駐車スペースの座標情報をDBへ保存する。

登録後の通常表示ではYOLOを再実行せず、DBに保存された画像と駐車スペース情報を利用して表示する。

---

# 2. 全体フロー

```text
ユーザー
  ↓
駐車場登録画面
  ↓
画像アップロード
  ↓
Backend
  ↓
YOLOによる駐車スペース検出
  ↓
検出結果をFrontendへ返却
  ↓
画像＋検出された駐車枠を表示
  ↓
ユーザーが確認・修正
  ↓
「登録」ボタン
  ↓
Backendへ確定データ送信
  ↓
画像を保存
  ↓
parking_spacesへ座標情報を保存
  ↓
登録完了
```

---

# 3. DB設計

既存のDB構造をできるだけ変更せずに利用する。

## parkings

駐車場自体の情報を管理する。

既存カラムに加えて、必要であれば画像の保存場所を管理するカラムを追加する。

例：

```text
id
name
capacity
image_path
```

画像そのものをPostgreSQLに直接保存するのではなく、基本的には画像ファイルを保存し、DBには保存先のパスまたはURLを保存する。

---

## parking_spaces

駐車スペースごとの情報を管理する。

既存の以下の情報を利用する。

```text
id
parking_id
type
status
sensor_id
x
y
width
height
```

座標はアップロードされた「元画像」を基準とする。

例えば元画像が1920×1080の場合、

```text
x = 500
y = 300
width = 100
height = 50
```

のように保存する。

---

# 4. Backend実装

## 4-1. 画像アップロードAPI

新規APIを作成する。

例：

```http
POST /api/v1/parkings/preview
```

役割：

* 画像を受け取る
* 一時的に保存する
* YOLOへ画像を渡す
* YOLOの検出結果を取得する
* フロントエンドへ検出結果を返す

この段階ではDBへの本登録は行わない。

---

## 4-2. YOLO検出結果

YOLOのbounding boxを駐車スペース情報へ変換する。

YOLOから、

```text
x1
y1
x2
y2
confidence
class
```

などを取得した場合、

```text
x = x1
y = y1
width = x2 - x1
height = y2 - y1
```

へ変換する。

Frontendへは例えば以下のようなJSONを返す。

```json
{
  "image_width": 1920,
  "image_height": 1080,
  "image_path": "/temporary/xxxxx.jpg",
  "spaces": [
    {
      "x": 500,
      "y": 300,
      "width": 100,
      "height": 50,
      "confidence": 0.82
    },
    {
      "x": 620,
      "y": 300,
      "width": 100,
      "height": 50,
      "confidence": 0.76
    }
  ]
}
```

---

# 5. Frontend実装

## 5-1. 駐車場登録画面

以下の操作を実装する。

1. 画像を選択
2. Backendへ画像を送信
3. YOLOの検出結果を受け取る
4. 元画像を表示
5. 画像上に駐車スペースをオーバーレイ表示
6. ユーザーが検出結果を確認
7. 必要に応じて枠を修正・削除・追加
8. 「登録」ボタンを押す
9. 確定データをBackendへ送信

---

# 6. 駐車枠の表示

画像と駐車枠の座標系を一致させる。

DBには元画像基準の座標を保存する。

Frontendで画像を縮小表示した場合は、表示倍率を計算して座標を変換する。

例えば、

```text
元画像
1920 × 1080

表示画像
960 × 540
```

の場合、

```text
scaleX = 960 / 1920
scaleY = 540 / 1080
```

として表示位置を計算する。

元画像の座標自体は変更しない。

---

# 7. ユーザーによる修正

YOLOの検出精度が完全ではないことを前提とする。

ユーザーが以下の操作をできるようにする。

* 検出された駐車枠を選択
* 枠を移動
* 枠のサイズを変更
* 不要な枠を削除
* 駐車枠を追加

ただし、最初の実装では操作を複雑にしすぎない。

最低限、

```text
削除
追加
移動
サイズ変更
```

を実現できればよい。

---

# 8. 登録確定API

例：

```http
POST /api/v1/parkings
```

または既存の駐車場登録APIを拡張する。

送信するデータの例：

```json
{
  "name": "前沢PA 上り",
  "capacity": 47,
  "image_path": "/parkings/xxxxx.jpg",
  "spaces": [
    {
      "type": "compact",
      "x": 500,
      "y": 300,
      "width": 100,
      "height": 50
    },
    {
      "type": "large",
      "x": 620,
      "y": 300,
      "width": 120,
      "height": 60
    }
  ]
}
```

Backendでは、

1. 駐車場を作成
2. 画像を正式な保存場所へ保存
3. `parkings.image_path`を保存
4. `parking_spaces`を一括登録
5. 必要な場合はセンサーとの紐付けを行う

という処理を行う。

---

# 9. トランザクション

駐車場登録時は、できるだけ一連の処理を1つのトランザクションとして扱う。

例えば、

```text
parking作成成功
 ↓
parking_spaces作成失敗
```

となった場合に、駐車場だけDBに残らないようにする。

以下の処理がすべて成功した場合のみ確定する。

```text
parking
画像情報
parking_spaces
```

失敗した場合はDBをロールバックする。

---

# 10. 登録後の駐車場表示

登録済み駐車場を表示するときはYOLOを実行しない。

```text
Frontend
 ↓
GET /api/v1/parkings/{parking_id}
 ↓
Backend
 ↓
DB
 ↓
画像パス
parking_spaces
 ↓
Frontend
```

Frontendでは、

```text
画像
 +
parking_spacesのx/y/width/height
```

を利用して駐車枠を描画する。

---

# 11. センサー処理との連携

駐車場登録後は、既存のセンサー監視処理と連携する。

センサー監視処理はBackendのみで動作させる。

```text
10秒ごと
 ↓
外部センサーAPI
 ↓
motion取得
 ↓
前回状態と比較
 ↓
状態変化を確認
 ↓
必要な場合のみDB更新
```

FrontendはセンサーAPIを直接呼び出さない。

FrontendはDBから取得した駐車スペースの状態を表示する。

---

# 12. APIの役割

最終的に以下のような構成を想定する。

### 駐車場

```http
GET /api/v1/parkings
```

駐車場一覧を取得。

```http
GET /api/v1/parkings/{parking_id}
```

駐車場情報・画像・駐車スペース情報を取得。

```http
POST /api/v1/parkings/preview
```

画像をYOLOに渡し、登録前の検出結果を取得。

```http
POST /api/v1/parkings
```

ユーザーが確認した駐車場情報を正式登録。

---

### 駐車スペース

必要に応じて、

```http
GET /api/v1/parkings/{parking_id}/spaces
```

で駐車スペース一覧を取得する。

駐車スペースの状態更新は基本的にBackend内部のセンサー処理から行う。

---

# 13. 実装順序

以下の順番で実装する。

### Step 1

既存のDBモデルを確認。

* `parkings`
* `parking_spaces`
* `sensors`

の現在の構造を確認する。

既存機能を壊さないようにする。

### Step 2

画像保存方法を決定。

開発環境ではBackendコンテナ内の保存領域を利用してもよい。

将来的にS3等へ変更できるよう、画像保存処理を独立した関数・サービスにする。

### Step 3

YOLO推論処理をBackendから呼び出せるようにする。

入力：

```text
画像
```

出力：

```text
駐車スペースのbounding box
```

### Step 4

`POST /parkings/preview` を実装。

この段階ではDBへ正式登録しない。

### Step 5

Frontendで画像＋YOLO検出枠を表示。

### Step 6

Frontendで検出結果を編集できるようにする。

### Step 7

登録確定APIを実装。

画像とparking_spacesを正式登録する。

### Step 8

登録済み駐車場をDBから取得して表示。

YOLOを再実行せず、DBの座標を利用する。

### Step 9

センサー監視処理とparking_spacesを連携。

### Step 10

Frontendから一定間隔で駐車場情報を取得し、最新の状態を表示する。

---

# 14. 重要な設計方針

以下を必ず守る。

* YOLOの検出結果を即DBへ登録しない
* ユーザーが確認・修正してから正式登録する
* 登録済み駐車場の表示時にYOLOを再実行しない
* `parking_spaces`には元画像基準の座標を保存する
* 画像そのものと駐車枠情報を分離して管理する
* センサー処理はBackend側で実行する
* FrontendからDBへ直接アクセスしない
* DB更新の判断ロジックをFrontendに持たせない
* 既存のDB構造・APIを可能な限り維持する
* 既存機能を壊さないように段階的に実装する

---

# 15. 完成後の全体構成

```text
                  駐車場登録時
                       │
                       ↓
                   画像Upload
                       │
                       ↓
                   Backend
                       │
                       ↓
                     YOLO
                       │
                       ↓
                検出結果を返却
                       │
                       ↓
                  Frontend確認
                       │
                       ↓
                    登録確定
                       │
              ┌────────┴────────┐
              ↓                 ↓
          画像保存          DB登録
                                │
                         parking_spaces
                                │
                                ↓
                         センサー監視
                                │
                          10秒ごと取得
                                │
                                ↓
                         必要時DB更新
                                │
                                ↓
                          Frontend取得
                                │
                                ↓
                         最新状態を表示
```

この構成を基本方針として実装する。
