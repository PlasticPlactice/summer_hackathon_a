import { ParkingStatus } from "../../../types/parking";
import { calcOccupiedByType } from "../areaListItem/calcOccupiedByType";

type AdminParkListTableProps = {
  parkings: ParkingStatus[];
};

// 満車率に応じて色を返す関数(ユーザー向け一覧のAreaListItemと同じ基準)
function getColorClass(rate: number): string {
  if (rate >= 90) return "#FF4E51";
  if (rate >= 60) return "#FFBC4C";
  return "#4EFA4D";
}

export default function AdminParkListTable({ parkings }: AdminParkListTableProps) {
  return (
    <table className="admin-park-list w-full text-xs border-collapse">
      <thead>
        <tr className="border-b border-gray-300 text-left">
          <th className="p-2">ID</th>
          <th className="p-2">駐車場名</th>
          <th className="p-2">小型車(使用中/合計)</th>
          <th className="p-2">大型車(使用中/合計)</th>
          <th className="p-2">満車率</th>
        </tr>
      </thead>
      <tbody>
        {parkings.length > 0 ? (
          parkings.map((parking) => {
            const occupied = calcOccupiedByType(parking.spaces);
            const rate =
              parking.capacity > 0 ? (occupied.compact + occupied.large) / parking.capacity * 100 : 0;
            return (
              <tr key={parking.id} className="border-b border-gray-200">
                <td className="p-2">{parking.id}</td>
                <td className="p-2">{parking.name}</td>
                <td className="p-2">
                  {occupied.compact}/{parking.compact_capacity}
                </td>
                <td className="p-2">
                  {occupied.large}/{parking.large_capacity}
                </td>
                <td className="p-2" style={{ color: getColorClass(rate) }}>
                  {Math.round(rate)}%
                </td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td className="p-2 text-gray-500" colSpan={5}>
              駐車場データがありません
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
