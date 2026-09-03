import { ParkingSpace } from "../../../../types/parking";

type VehicleCount = {
  large: number;
  small: number;
};

// 写真表示(検出データ)の駐車場向け: レイアウト定義を介さず、spaces配列そのものを
// type(compact/large)とstatus(空車/満車)で集計して規模・空き台数を算出する
export function calcVehicleCountsFromSpaces(spaces: ParkingSpace[]): {
  capacity: VehicleCount;
  available: VehicleCount;
} {
  const capacity: VehicleCount = { large: 0, small: 0 };
  const available: VehicleCount = { large: 0, small: 0 };

  spaces.forEach((space) => {
    const key = space.type === "large" ? "large" : "small";
    capacity[key] += 1;
    if (space.status === 0) {
      available[key] += 1;
    }
  });

  return { capacity, available };
}
