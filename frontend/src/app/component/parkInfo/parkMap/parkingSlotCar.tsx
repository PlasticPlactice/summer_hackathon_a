import Image from "next/image";
import { ParkingSpace } from "../../../../types/parking";

interface ParkingSlotCarProps {
    slot: ParkingSpace;
    flipped?: boolean; // マップ上下左右反転時、車アイコンだけ正立に保つ
    style?: React.CSSProperties; // 指定時、既定サイズ(w-7 h-15)より優先される(駐車場登録画面の検出枠オーバーレイ用)
}

function ParkingSlotCar({ slot, flipped = false, style }: ParkingSlotCarProps){
    const occupied = slot.status === 1;
    return(
        <div style={style} className={`relative w-7 h-15 border ${occupied ? "bg-red-200 border-red-400" : "bg-green-200 border-green-400"}`}>
            {occupied && (
                <Image src="/car.png" alt="満車" fill sizes="28px" className={`object-contain ${flipped ? "rotate-180" : ""}`} />
            )}
        </div>
    )
}

export default ParkingSlotCar;