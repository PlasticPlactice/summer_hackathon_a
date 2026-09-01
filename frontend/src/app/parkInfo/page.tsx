import ParkInfo from "../component/parkInfo/parkInfo";
import ParkMap from "../component/parkInfo/parkMap/parkMap";
import { ParkRow } from "../component/parkInfo/parkMap/parkLine";
import { calcVehicleCounts } from "../component/parkInfo/parkMap/calcVehicleCounts";

// SA名
const saName = "前沢SA";

// 駐車場の列ごとの構成。行のtype(car/track)と各枠の満車状況(true=満車)はここで直接編集して調整する
// (将来的にはAPIやセンサーから取得したParkingSpace[]に置き換える)
// 列は何行でも追加可能(例: 車列を複数にする、トラック列を増やす等)
const rawParkingRows: { type: "car" | "track"; slots: boolean[] }[] = [
  {
    type: "car",
    slots: [
      true, false, false, true, false, false, false, true, false, false, true, false, false, true,false,false,false
    ],
  },
  {
    type: "car",
    slots: [
      false, true, false, false, true, false, false, true, false, false, true, false, false, true,false
    ],
  },
  {
    type: "car",
    slots: [
      false, false, false, false, false, false, false, false, false, false, false, false, false, false, false
    ],
  },
  {
    type: "car",
    slots: [
      true, false, false, false, false, false, false, true, false, false, false, false, false, false, false
    ],
  },
  {
    type: "car",
    slots: [
      false, true, false, false, false, false, false, false, false, false, true, false, false, true,false
    ],
  },
  {
    type: "track",
    slots: [true, true, false, false, true, false, true, false, true, true, true],
  },
  {
    type: "track",
    slots: [true, true, false, true, true, false, true, true, true, true, true],
  },
];

// 満車状況(boolean)をParkingSpace形状に変換する(id/parking_id/sensor_idは今はダミー)
let nextSpaceId = 1;
const parkingRows: ParkRow[] = rawParkingRows.map((row) => ({
  type: row.type,
  slots: row.slots.map((occupied) => ({
    id: nextSpaceId++,
    type: row.type === "track" ? "large" : "compact",
    status: occupied ? 1 : 0,
    parking_id: null,
    sensor_id: null,
  })),
}));

// SAごとの設置施設の有無(将来複数SA/PAを扱う際はSAごとにこの設定を用意する)
const facilities = {
  parking: true,
  toilet: true,
  food: true,
  gasStation: true,
  info: true,
  bed: false,
};

// 駐車場規模と現在の空き台数(車種別)はparkingRowsから算出する
const { capacity, available } = calcVehicleCounts(parkingRows);

export default function ParkInfoPage() {
  return (
    <main  className="overflow-x-hidden">
      <ParkInfo
        saName={saName}
        capacity={capacity}
        available={available}
        facilities={facilities}
      />
      <ParkMap rows={parkingRows} />
    </main>
  );
}