from fastapi import APIRouter, Depends, HTTPException, Request, status, File, UploadFile
from sqlalchemy.orm import Session
import io
import os
import sys
from pathlib import Path

try:
    from PIL import Image
except ModuleNotFoundError:  # pragma: no cover - 依存未導入時のフォールバック
    Image = None

# services モジュールをインポート可能にする
backend_dir = Path(__file__).resolve().parent.parent.parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.db.session import get_db
from app.core.auth import require_admin
from app.models.parking import Parking
from app.models.sensor import Sensor
from app.models.spaces import Parking_spaces
from app.schemas.parking import ParkingCreate, ParkingStatusResponse, ParkingRegisterRequest
from app.schemas.spaces import ParkingSpaceResponse, ParkingPreviewResponse, normalize_space_type
from services.image_service import save_temp_image, save_parking_image, delete_temp_image
from services.parking_detector import detect_parking_spaces, convert_detections_to_spaces

router = APIRouter(prefix="/parkings", tags=["parkings"])


def build_parking_status_response(parking: Parking, db: Session) -> ParkingStatusResponse:
    spaces = db.query(Parking_spaces).filter(Parking_spaces.parking_id == parking.id).all()
    space_responses = [ParkingSpaceResponse.model_validate(s) for s in spaces]

    # status == 0 を空車（available）とみなす（※0: 空車, 1: 満車/使用中）
    available_count = sum(1 for s in spaces if s.status == 0)
    occupied_count = sum(1 for s in spaces if s.status != 0)

    return ParkingStatusResponse(
        id=parking.id,
        name=parking.name,
        capacity=parking.capacity,
        compact_capacity=parking.compact_capacity,
        large_capacity=parking.large_capacity,
        image_path=parking.image_path,
        available_spaces=available_count,
        occupied_spaces=occupied_count,
        spaces=space_responses,
    )


@router.post(
    "/preview",
    response_model=ParkingPreviewResponse,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_admin)],
)
async def preview_parking_spaces(file: UploadFile = File(...)):
    """
    駐車場画像をアップロードし、YOLO検出結果をプレビュー
    
    - 画像をアップロード
    - YOLOで駐車スペースを検出
    - 検出結果（座標、信頼度）を返す
    
    戻り値：
        - image_width, image_height: 元画像のサイズ
        - image_path: 一時保存された画像のパス
        - spaces: 検出された駐車スペースのリスト
    """
    try:
        if Image is None:
            raise RuntimeError("Pillow is not installed. Please install the backend requirements before uploading images.")

        # ファイルの内容を読み込む
        file_content = await file.read()

        # 画像サイズを取得
        image = Image.open(io.BytesIO(file_content))
        image_width, image_height = image.size
        
        # 一時画像として保存
        temp_image_path = save_temp_image(file_content, file.filename or "image.jpg")
        
        # YOLO で駐車スペースを検出
        detections = detect_parking_spaces(temp_image_path)
        
        # 検出結果を駐車スペース情報に変換
        spaces = convert_detections_to_spaces(detections, image_width, image_height)
        
        return ParkingPreviewResponse(
            image_width=image_width,
            image_height=image_height,
            image_path=temp_image_path,
            spaces=spaces,
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to process image: {str(e)}",
        )


async def _parse_parking_payload(request: Request):
    """JSON または multipart/form-data の両方を受け取れるようにする。"""
    content_type = request.headers.get("content-type", "")

    if "multipart/form-data" in content_type:
        form = await request.form()
        file_val = form.get("file")
        image_path_val = form.get("image_path")
        return {
            "name": form.get("name"),
            "capacity": form.get("capacity"),
            "compact_capacity": form.get("compact_capacity"),
            "large_capacity": form.get("large_capacity"),
            "file": file_val,
            "image_path": image_path_val if isinstance(image_path_val, str) else None,
            "spaces": form.get("spaces"),
        }

    payload = await request.json()
    return payload


@router.post(
    "",
    response_model=ParkingStatusResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
async def create_parking(request: Request, db: Session = Depends(get_db)):
    """
    駐車場登録フロー:
    1. リクエスト（画像ファイルまたは画像パス + 駐車場情報）を受け取る
    2. parkings に登録して ID を取得
    3. 画像を保存し YOLO で駐車スペースを自動検出
    4. 検出された駐車スペースを parking_spaces に一元登録
    5. コミットして結果を返却
    """
    payload = await _parse_parking_payload(request)

    if not isinstance(payload, dict):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid request payload format",
        )

    name = payload.get("name")
    capacity = payload.get("capacity")
    compact_capacity = payload.get("compact_capacity")
    large_capacity = payload.get("large_capacity")
    image_file = payload.get("file")
    image_path = payload.get("image_path")
    provided_spaces = payload.get("spaces") or []

    if not name or capacity is None or compact_capacity is None or large_capacity is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="name, capacity, compact_capacity, large_capacity are required",
        )

    temp_image_path = None
    final_image_path = None

    try:
        # 画像ファイル（UploadFile等）が直接送信された場合
        if image_file is not None and hasattr(image_file, "read"):
            file_content = await image_file.read()
            filename = getattr(image_file, "filename", "parking.jpg") or "parking.jpg"
            temp_image_path = save_temp_image(file_content, filename)
            image_path = temp_image_path
        elif isinstance(image_file, str) and image_file.strip():
            # file項目にパス文字列が送られてきた場合
            image_path = image_file.strip()

        parking = Parking(
            name=name,
            capacity=int(capacity),
            compact_capacity=int(compact_capacity),
            large_capacity=int(large_capacity),
        )
        db.add(parking)
        db.flush()

        if image_path:
            final_image_path = save_parking_image(image_path, parking.id)
            parking.image_path = final_image_path
            db.add(parking)
            db.flush()

            if temp_image_path and os.path.exists(temp_image_path) and temp_image_path != final_image_path:
                delete_temp_image(temp_image_path)

            # 画像から YOLO 検出で駐車スペースを全自動生成
            detections = detect_parking_spaces(final_image_path)
            detected_spaces = convert_detections_to_spaces(detections, 1920, 1080)

            # 未割り当ての空きセンサーを優先順位で割り当てる関数
            def assign_available_sensors(spaces_list):
                # 既にいずれかの駐車スペースに割り当てられている sensor_id を取得
                used_sensor_ids = set(
                    r[0] for r in db.query(Parking_spaces.sensor_id).filter(Parking_spaces.sensor_id.isnot(None)).all()
                )
                # まだ割り当てられていないセンサーを ID 順に取得
                available_sensors = (
                    db.query(Sensor)
                    .filter(~Sensor.id.in_(used_sensor_ids) if used_sensor_ids else True)
                    .order_by(Sensor.id.asc())
                    .all()
                )
                sensor_idx = 0
                for sp in spaces_list:
                    if sensor_idx < len(available_sensors):
                        s = available_sensors[sensor_idx]
                        sp.sensor_id = s.id
                        sp.status = s.status
                        sensor_idx += 1
                    else:
                        sp.sensor_id = None

            space_models = []
            for idx, space in enumerate(detected_spaces, start=1):
                normalized_type = normalize_space_type(space["type"])
                space_models.append(
                    Parking_spaces(
                        parking_id=parking.id,
                        parking_number=idx,
                        type=normalized_type,
                        status=0,
                        x=float(space["x"]),
                        y=float(space["y"]),
                        width=float(space["width"]),
                        height=float(space["height"]),
                    )
                )

            assign_available_sensors(space_models)
            db.add_all(space_models)
        elif provided_spaces:
            space_models = []
            for idx, space in enumerate(provided_spaces, start=1):
                normalized_type = normalize_space_type(space.get("type"))
                space_models.append(
                    Parking_spaces(
                        parking_id=parking.id,
                        parking_number=space.get("parking_number") or idx,
                        type=normalized_type,
                        status=0,
                        x=float(space["x"]),
                        y=float(space["y"]),
                        width=float(space["width"]),
                        height=float(space["height"]),
                    )
                )

            # 未割り当ての空きセンサーを優先順位で割り当てる関数（provided_spacesの場合）
            used_sensor_ids = set(
                r[0] for r in db.query(Parking_spaces.sensor_id).filter(Parking_spaces.sensor_id.isnot(None)).all()
            )
            available_sensors = (
                db.query(Sensor)
                .filter(~Sensor.id.in_(used_sensor_ids) if used_sensor_ids else True)
                .order_by(Sensor.id.asc())
                .all()
            )
            sensor_idx = 0
            for sp in space_models:
                if sp.sensor_id is None:
                    if sensor_idx < len(available_sensors):
                        s = available_sensors[sensor_idx]
                        sp.sensor_id = s.id
                        sp.status = s.status
                        sensor_idx += 1

            db.add_all(space_models)

        db.commit()
        db.refresh(parking)

        return build_parking_status_response(parking, db)

    except Exception as exc:
        db.rollback()
        if final_image_path and os.path.exists(final_image_path):
            os.remove(final_image_path)
        if temp_image_path and os.path.exists(temp_image_path):
            os.remove(temp_image_path)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create parking: {str(exc)}",
        )


@router.get("", response_model=list[ParkingStatusResponse])
def get_all_parkings_status(db: Session = Depends(get_db)):
    """すべての駐車場の現在状況を取得します"""
    parkings = db.query(Parking).all()
    result = [build_parking_status_response(p, db) for p in parkings]
    return result


@router.get("/{parking_id}", response_model=ParkingStatusResponse)
def get_parking_status(parking_id: int, db: Session = Depends(get_db)):
    """指定した個別の駐車場の現在状況を取得します"""
    parking = db.query(Parking).filter(Parking.id == parking_id).first()
    if not parking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Parking with id {parking_id} not found",
        )

    return build_parking_status_response(parking, db)


@router.put(
    "/{parking_id}",
    response_model=ParkingStatusResponse,
    dependencies=[Depends(require_admin)],
)
def update_parking(
    parking_id: int,
    parking_in: ParkingCreate,
    db: Session = Depends(get_db),
):
    """駐車場情報を更新します"""
    parking = db.query(Parking).filter(Parking.id == parking_id).first()
    if not parking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Parking with id {parking_id} not found",
        )
    for key, value in parking_in.model_dump().items():
        setattr(parking, key, value)
    db.commit()
    db.refresh(parking)
    return build_parking_status_response(parking, db)


@router.delete(
    "/{parking_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def delete_parking(parking_id: int, db: Session = Depends(get_db)):
    """駐車場を削除します"""
    parking = db.query(Parking).filter(Parking.id == parking_id).first()
    if not parking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Parking with id {parking_id} not found",
        )
    db.delete(parking)
    db.commit()
    return None
