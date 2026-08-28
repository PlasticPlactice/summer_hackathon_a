import ParkingSlotCar from "./parkingSlotCar";
import ParkingSlotTrack from "./parkingSlotTrack";

export interface ParkRow {
    type: "car" | "track"; // 車種によって表示する駐車枠コンポーネントを切り替える
    slots: boolean[]; // 駐車枠ごとの満車状況(true=満車)
}

type ParkLineProps = ParkRow;

function ParkLine({ type, slots }: ParkLineProps) {
    return (
        <div className="flex justify-center gap-1 mx-2 mb-6">
            {slots.map((slot, index) =>
                type === "car" ? (
                    <ParkingSlotCar key={index} slot={slot} />
                ) : (
                    <ParkingSlotTrack key={index} slot={slot} />
                )
            )}
        </div>
    );
}

export default ParkLine;
