from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
import io
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
from app.models.parking import Parking
from app.models.spaces import Parking_spaces
from app.schemas.parking import ParkingCreate, ParkingStatusResponse, ParkingRegisterRequest
from app.schemas.spaces import ParkingSpaceResponse, ParkingPreviewResponse
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
        available_spaces=available_count,
        occupied_spaces=occupied_count,
        spaces=space_responses,
    )


@router.post("/preview", response_model=ParkingPreviewResponse, status_code=status.HTTP_200_OK)
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


@router.post("", response_model=ParkingStatusResponse, status_code=status.HTTP_201_CREATED)
def create_parking(
    parking_in: ParkingRegisterRequest,
    db: Session = Depends(get_db),
):
    """
    駐車場を新規登録します（画像 + 駐車スペース情報をまとめて登録）
    
    トランザクション処理：
    - 駐車場作成失敗時はロールバック
    - 画像保存失敗時はロールバック
    - parking_spaces作成失敗時はロールバック
    """
    try:
        # 駐車場を作成
        parking = Parking(
            name=parking_in.name,
            capacity=parking_in.capacity,
            compact_capacity=parking_in.compact_capacity,
            large_capacity=parking_in.large_capacity,
        )
        db.add(parking)
        db.flush()  # ID を取得するため flush
        
        # 一時画像を正式な保存場所に移動
        final_image_path = save_parking_image(parking_in.image_path, parking.id)
        parking.image_path = final_image_path
        db.merge(parking)
        db.flush()
        
        # 駐車スペースを登録
        for space_data in parking_in.spaces:
            space = Parking_spaces(
                parking_id=parking.id,
                type=space_data.type,
                status=0,  # 初期状態は空車
                x=space_data.x,
                y=space_data.y,
                width=space_data.width,
                height=space_data.height,
            )
            db.add(space)
        
        db.commit()
        db.refresh(parking)
        
        return build_parking_status_response(parking, db)
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create parking: {str(e)}",
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


@router.put("/{parking_id}", response_model=ParkingStatusResponse)
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


@router.delete("/{parking_id}", status_code=status.HTTP_204_NO_CONTENT)
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

