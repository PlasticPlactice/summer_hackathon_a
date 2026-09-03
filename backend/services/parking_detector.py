import statistics
from pathlib import Path

try:
    from ultralytics import YOLO
except ModuleNotFoundError:  # pragma: no cover - コンテナ/依存未導入時のフォールバック
    YOLO = None


MODEL_PATH = (Path(__file__).resolve().parent / "models" / "last.pt").resolve()
model = YOLO(str(MODEL_PATH)) if YOLO is not None and MODEL_PATH.exists() else None


def detect_parking_spaces(image_path):
    """
    YOLO で駐車スペースを検出

    Args:
        image_path: 画像ファイルのパス

    Returns:
        検出結果（bounding box）のリスト
    """
    if model is None:
        raise RuntimeError("ultralytics is not installed. Please install the minimal YOLO dependencies before calling preview API.")

    results = model.predict(
        source=image_path,
        conf=0.7,
    )

    detections = []

    for result in results:
        for box in result.boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            confidence = float(box.conf[0])

            detections.append({
                "x1": x1,
                "y1": y1,
                "x2": x2,
                "y2": y2,
                "confidence": confidence,
            })

    return detections


def determine_space_type(width: int, height: int, median_box_area: float) -> str:
    """検出された枠の中央値を基準にした面積比で compact / large を判定する。
    最小値を基準にすると、誤検出などで極端に小さい枠が1つ混ざるだけで
    他の枠が軒並みlarge判定になってしまうため、外れ値に強い中央値を基準にする。
    幅・高さを個別に閾値判定すると、撮影アングルの都合で列ごとに枠の縦横比が
    変わる場合（例: 端の列だけ横長に写る等）に、実際の大きさは同じでも
    向きの違いだけで large と誤判定されてしまうため、向きに影響されない
    面積比のみで判定する。
    """
    if median_box_area <= 0:
        return "compact"

    area = width * height
    area_ratio = area / median_box_area

    # 中央値サイズの 2 倍以上なら large とみなす
    if area_ratio >= 2.0:
        return "large"
    return "compact"


def convert_detections_to_spaces(detections: list, image_width: int, image_height: int) -> list:
    """
    YOLOの検出結果を駐車スペース情報に変換
    
    Args:
        detections: YOLO検出結果のリスト
        image_width: 元画像の幅
        image_height: 元画像の高さ
    
    Returns:
        駐車スペース情報のリスト
    """
    spaces = []
    box_sizes = []

    for detection in detections:
        x1 = detection["x1"]
        y1 = detection["y1"]
        x2 = detection["x2"]
        y2 = detection["y2"]
        width = int(x2 - x1)
        height = int(y2 - y1)
        box_sizes.append((width, height))

    median_box_area = statistics.median(w * h for w, h in box_sizes) if box_sizes else 0

    for detection in detections:
        x1 = detection["x1"]
        y1 = detection["y1"]
        x2 = detection["x2"]
        y2 = detection["y2"]
        confidence = detection["confidence"]

        width = int(x2 - x1)
        height = int(y2 - y1)
        space_type = determine_space_type(width, height, median_box_area)

        space = {
            "x": int(x1),
            "y": int(y1),
            "width": width,
            "height": height,
            "confidence": confidence,
            "type": space_type,
        }
        spaces.append(space)
    
    return spaces

