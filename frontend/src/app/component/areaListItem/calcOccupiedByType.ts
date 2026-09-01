import { ParkingSpace } from "../../../types/parking";

// spacesから種別ごと(compact/large)の使用中(status===1)台数を集計する
export function calcOccupiedByType(spaces: ParkingSpace[]): {
  compact: number;
  large: number;
} {
  const compact = spaces.filter((s) => s.type === "compact" && s.status === 1).length;
  const large = spaces.filter((s) => s.type === "large" && s.status === 1).length;
  return { compact, large };
}
