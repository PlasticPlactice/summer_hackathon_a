import Image from "next/image";
import { ParkingSpace } from "../../../../types/parking";

interface ParkingSlotCarProps {
    slot: ParkingSpace;
}

function ParkingSlotCar({ slot }: ParkingSlotCarProps){
    const occupied = slot.status === 1;
    return(
        <div className={`relative w-7 h-15 border ${occupied ? "bg-red-200 border-red-400" : "bg-green-200 border-green-400"}`}>
            {occupied && (
                <Image src="/car.png" alt="満車" fill sizes="28px" className="object-contain" />
            )}
        </div>
    )
}

export default ParkingSlotCar;