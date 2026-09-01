import Image from "next/image";
import { ParkingSpace } from "../../../../types/parking";

interface ParkingSlotTrackProps {
    slot: ParkingSpace;
}

function ParkingSlotTrack({ slot }: ParkingSlotTrackProps){
    const occupied = slot.status === 1;
    return(
        <div className={`relative w-8 h-24 border ${occupied ? "bg-red-200 border-red-400" : "bg-green-200 border-green-400"}`}>
            {occupied && (
                <Image src="/track.png" alt="満車" fill sizes="32px" className="object-contain" />
            )}
        </div>
    )
}

export default ParkingSlotTrack;