from ultralytics import YOLO

model = YOLO("./models/last.pt")


def detect_parking_spaces(image_path):
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
