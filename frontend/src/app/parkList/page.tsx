"use client";
import ExplanatoryNotes from "../component/explanatoryNotes";
import AreaListItem from "../component/areaListItem/areaListItem";
import { useState } from "react";
import { ParkingSpace, ParkingStatus } from "../../types/parking";

// areaType(SA/PA)とcolor(混雑度による色分け)はバックエンドのスキーマに存在しないUI専用の情報
// (将来API接続する際は、バックエンド側に区分を持たせるか、フロント側で名称等から判定するロジックが別途必要)
type ParkingListItem = ParkingStatus & {
  color: string;
  areaType: "SA" | "PA";
};

// ダミーのデータ。台数はここで直接編集して調整する(将来的にはAPIから取得したParkingStatus[]に置き換える)
type RawParkingMock = {
  id: number;
  name: string;
  color: string;
  areaType: "SA" | "PA";
  compact_capacity: number;
  large_capacity: number;
  compact_used: number;
  large_used: number;
};

const RAW_MOCK_DATA: RawParkingMock[] = [
  { id: 1, name: "前沢SA", color: "#FFBC4C", areaType: "SA", compact_capacity: 158, large_capacity: 48, compact_used: 100, large_used: 40 },
  { id: 2, name: "紫波SA", color: "#4EFA4D", areaType: "SA", compact_capacity: 176, large_capacity: 82, compact_used: 5, large_used: 5 },
  { id: 3, name: "岩手山SA", color: "#FFBC4C", areaType: "SA", compact_capacity: 182, large_capacity: 64, compact_used: 100, large_used: 60 },
  { id: 4, name: "矢巾PA", color: "#FF4E51", areaType: "PA", compact_capacity: 62, large_capacity: 24, compact_used: 62, large_used: 24 },
  { id: 5, name: "滝沢SA", color: "#4EFA4D", areaType: "SA", compact_capacity: 36, large_capacity: 51, compact_used: 5, large_used: 5 },
  { id: 6, name: "上河内SA", color: "#4EFA4D", areaType: "SA", compact_capacity: 239, large_capacity: 98, compact_used: 5, large_used: 5 },
];

// RawParkingMock(手編集用の集計値)からParkingStatus形状(spaces込み)を組み立てる
// (id等はダミー。将来的にはこの関数ごとAPIレスポンスの利用に置き換える)
let nextSpaceId = 1;
function buildParkingListItem(raw: RawParkingMock): ParkingListItem {
  const spaces: ParkingSpace[] = [
    ...Array.from({ length: raw.compact_capacity }, (_, i) => ({
      id: nextSpaceId++,
      type: "compact",
      status: i < raw.compact_used ? 1 : 0,
      parking_id: raw.id,
      sensor_id: null,
    })),
    ...Array.from({ length: raw.large_capacity }, (_, i) => ({
      id: nextSpaceId++,
      type: "large",
      status: i < raw.large_used ? 1 : 0,
      parking_id: raw.id,
      sensor_id: null,
    })),
  ];
  const capacity = raw.compact_capacity + raw.large_capacity;
  const occupied_spaces = raw.compact_used + raw.large_used;

  return {
    id: raw.id,
    name: raw.name,
    capacity,
    compact_capacity: raw.compact_capacity,
    large_capacity: raw.large_capacity,
    available_spaces: capacity - occupied_spaces,
    occupied_spaces,
    spaces,
    color: raw.color,
    areaType: raw.areaType,
  };
}

const MOCK_DATA: ParkingListItem[] = RAW_MOCK_DATA.map(buildParkingListItem);

export default function ParkList() {
  // 検索条件用のstate
  const [areaType, setAreaType] = useState("none");
  const [areaName, setAreaName] = useState("");
  const [keyword, setKeyword] = useState("");
  // 検索実行時
  const handleSearch = () => {
    setKeyword(areaName);
  };

    // 表示データをフィルタリング
  const filteredData = MOCK_DATA.filter((item) => {
    // エリア種別のフィルタ(完全一致)
    const matchType = areaType === "none" ? true : item.areaType === areaType;

    // エリア名のフィルタ（部分一致）
    const matchName = keyword === "" ? true : item.name.includes(keyword);

    return matchType && matchName;
  });


  return (
    <main className="p-4 flex flex-col gap-4">
      {/* 検索 */}
      <div className="search flex flex-col gap-4">
        {/* エリア種別の選択 */}
        <div className="type-selection flex flex-col gap-2">
          <h3 className="text-xs font-bold">エリア種別</h3>
          <select
            className="type-select text-xs border rounded-sm p-1 border-gray-300 w-24"
            value={areaType}
            onChange={(e) => setAreaType(e.target.value)}
          >
            <option value="none">指定なし</option>
            <option value="SA">SA</option>
            <option value="PA">PA</option>
          </select>
        </div>
        {/* エリア名入力 */}
        <div className="search-box flex flex-col gap-2">
          <h3 className="text-xs font-bold">エリア名</h3>
          <div className="search-container flex items-center">
            <input
              type="text"
              className="search-input text-xs border rounded-tl-sm rounded-bl-sm p-1 border-gray-300 container flex-1 px-4 py-2 h-8"
              placeholder="エリア名を入力してください"
              value={areaName}
              onChange={(e) => setAreaName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
            <button
            className="bg-blue-500 px-6 py-2 text-white font-medium hover:bg-blue-600 transition-colors rounded-tr-sm rounded-br-sm h-8 text-xs"
            onClick={handleSearch}
            >
              検索
            </button>
          </div>
        </div>
      </div>
      {/* 凡例 */}
      <div className="explanatory-notes flex gap-5">
        <ExplanatoryNotes label="空き" color="#4EFA4D" />
        <ExplanatoryNotes label="混雑" color="#FFBC4C" />
        <ExplanatoryNotes label="満車" color="#FF4E51" />
      </div>
      {/* エリア一覧 */}
      <div className="area-list flex flex-col justify-between gap-5">
      {filteredData.length > 0 ? (
          filteredData.map((item) => (
            <AreaListItem
              key={item.id}
              parking={item}
              parkingTotalNumLarge={item.large_capacity}
              parkingTotalNumsmall={item.compact_capacity}
            />
          ))
        ) : (
          <p className="text-xs text-gray-500">該当するエリアがありません</p>
        )}
      </div>
    </main>
  );
}
