import Image from "next/image";
import { ParkingSpace } from "../../../../types/parking";

interface ParkingSlotCarProps {
    slot: ParkingSpace;
    flipped?: boolean; // マップ上下左右反転時、車アイコンだけ正立に保つ
}

function ParkingSlotCar({ slot, flipped = false }: ParkingSlotCarProps){
    const occupied = slot.status === 1;
    return(
        <div className={`relative w-7 h-15 border ${occupied ? "bg-red-200 border-red-400" : "bg-green-200 border-green-400"}`}>
            {occupied && (
                <Image src="/car.png" alt="満車" fill sizes="28px" className={`object-contain ${flipped ? "rotate-180" : ""}`} />
            )}
        </div>
    )
}

export default ParkingSlotCar;