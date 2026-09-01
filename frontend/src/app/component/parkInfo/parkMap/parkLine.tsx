import ParkingSlotCar from "./parkingSlotCar";
import ParkingSlotTrack from "./parkingSlotTrack";
import { ParkingSpace } from "../../../../types/parking";

export interface ParkRow {
    type: "car" | "track"; // 車種によって表示する駐車枠コンポーネントを切り替える(UI表示用の区分)
    slots: ParkingSpace[]; // 駐車枠ごとの状況(status: 0=空車, 1=満車)
}

type ParkLineProps = ParkRow & {
    flipped?: boolean; // マップ上下左右反転時、満車アイコンの向きを正立に保つために各枠へ伝える
};

function ParkLine({ type, slots, flipped = false }: ParkLineProps) {
    return (
        <div className="flex justify-center gap-1 mx-2 mb-6">
            {slots.map((slot) =>
                type === "car" ? (
                    <ParkingSlotCar key={slot.id} slot={slot} flipped={flipped} />
                ) : (
                    <ParkingSlotTrack key={slot.id} slot={slot} flipped={flipped} />
                )
            )}
        </div>
    );
}

export default ParkLine;
