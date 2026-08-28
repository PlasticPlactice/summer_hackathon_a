import Image from "next/image";

interface ParkingSlotTrackProps {
    slot: boolean; // true: 満車, false: 空車
}

function ParkingSlotTrack({ slot }: ParkingSlotTrackProps){
    return(
        <div className={`relative w-8 h-24 border ${slot ? "bg-red-200 border-red-400" : "bg-green-200 border-green-400"}`}>
            {slot && (
                <Image src="/track.png" alt="満車" fill className="object-contain" />
            )}
        </div>
    )
}

export default ParkingSlotTrack;