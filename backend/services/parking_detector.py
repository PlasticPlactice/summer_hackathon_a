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


def determine_space_type(width: int, height: int, min_box_area: float, min_box_width: float, min_box_height: float) -> str:
    """検出された最小枠を基準にしたサイズ比で compact / large を判定する。"""
    if min_box_area <= 0:
        return "compact"

    area = width * height
    area_ratio = area / min_box_area
    width_ratio = width / min_box_width if min_box_width > 0 else 1.0
    height_ratio = height / min_box_height if min_box_height > 0 else 1.0

    # 最小検出枠の 2 倍以上なら large とみなす
    if area_ratio >= 2.0 or max(width_ratio, height_ratio) >= 1.6:
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

    min_box = min((w * h, w, h) for w, h in box_sizes) if box_sizes else (0, 0, 0)
    min_box_area, min_box_width, min_box_height = min_box

    for detection in detections:
        x1 = detection["x1"]
        y1 = detection["y1"]
        x2 = detection["x2"]
        y2 = detection["y2"]
        confidence = detection["confidence"]

        width = int(x2 - x1)
        height = int(y2 - y1)
        space_type = determine_space_type(width, height, min_box_area, min_box_width, min_box_height)

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

