from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.parking import Parking
from app.models.spaces import Parking_spaces
from app.schemas.parking import ParkingCreate, ParkingStatusResponse
from app.schemas.spaces import ParkingSpaceResponse

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
        available_spaces=available_count,
        occupied_spaces=occupied_count,
        spaces=space_responses,
    )


@router.post("", response_model=ParkingStatusResponse, status_code=status.HTTP_201_CREATED)
def create_parking(
    parking_in: ParkingCreate,
    db: Session = Depends(get_db),
):
    """駐車場を新規登録します"""
    parking = Parking(**parking_in.model_dump())
    db.add(parking)
    db.commit()
    db.refresh(parking)
    return build_parking_status_response(parking, db)


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
