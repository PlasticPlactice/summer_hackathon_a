import { ParkRow } from "./parkLine";
import { ParkingSpace } from "../../../../types/parking";

export type RowLayout = {
  type: "car" | "track";
  slotCount: number;
};

// バックエンドから取得したスペース一覧(id昇順)を、フロント側の行レイアウト定義に
// 先頭から順に詰めて割り当てる。スペース数がレイアウトの想定数に満たない場合は
// そこで打ち切り(残りの行・枠は表示しない)
export function buildParkingRows(
  spaces: ParkingSpace[],
  layout: RowLayout[]
): ParkRow[] {
  const sortedSpaces = [...spaces].sort((a, b) => a.id - b.id);

  const rows: ParkRow[] = [];
  let cursor = 0;

  for (const row of layout) {
    const rowSlots = sortedSpaces.slice(cursor, cursor + row.slotCount);
    if (rowSlots.length === 0) break;

    rows.push({ type: row.type, slots: rowSlots });
    cursor += row.slotCount;
  }

  return rows;
}
