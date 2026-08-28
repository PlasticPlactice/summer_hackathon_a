import Image from "next/image";

interface ParkingSlotCarProps {
    slot: boolean; // true: 満車, false: 空車
}

function ParkingSlotCar({ slot }: ParkingSlotCarProps){
    return(
        <div className={`relative w-7 h-15 border ${slot ? "bg-red-200 border-red-400" : "bg-green-200 border-green-400"}`}>
            {slot && (
                <Image src="/car.png" alt="満車" fill className="object-contain" />
            )}
        </div>
    )
}

export default ParkingSlotCar;