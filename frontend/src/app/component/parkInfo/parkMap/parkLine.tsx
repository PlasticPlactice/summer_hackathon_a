import ParkingSlotCar from "./parkingSlotCar";
import ParkingSlotTrack from "./parkingSlotTrack";
import { ParkingSpace } from "../../../../types/parking";

export interface ParkRow {
    type: "car" | "track"; // 車種によって表示する駐車枠コンポーネントを切り替える(UI表示用の区分)
    slots: ParkingSpace[]; // 駐車枠ごとの状況(status: 0=空車, 1=満車)
}

type ParkLineProps = ParkRow;

function ParkLine({ type, slots }: ParkLineProps) {
    return (
        <div className="flex justify-center gap-1 mx-2 mb-6">
            {slots.map((slot) =>
                type === "car" ? (
                    <ParkingSlotCar key={slot.id} slot={slot} />
                ) : (
                    <ParkingSlotTrack key={slot.id} slot={slot} />
                )
            )}
        </div>
    );
}

export default ParkLine;
