import { ParkRow } from "./parkLine";

type VehicleCount = {
  large: number;
  small: number;
};

// parkingRowsの実データから駐車場規模(capacity)と空き台数(available)を集計する
// track行=大型車(large)、car行=小型車(small)として振り分ける
export function calcVehicleCounts(rows: ParkRow[]): {
  capacity: VehicleCount;
  available: VehicleCount;
} {
  const capacity: VehicleCount = { large: 0, small: 0 };
  const available: VehicleCount = { large: 0, small: 0 };

  rows.forEach((row) => {
    const key = row.type === "track" ? "large" : "small";
    capacity[key] += row.slots.length;
    available[key] += row.slots.filter((slot) => slot.status === 0).length;
  });

  return { capacity, available };
}
