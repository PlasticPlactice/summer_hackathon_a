"use client";
import { useState } from "react";
import ExplanatoryNotes from "../explanatoryNotes";
import AreaListItem from "../areaListItem/areaListItem";
import { ParkingStatus } from "../../../types/parking";

type AreaType = "SA" | "PA" | "other";

// 駐車場名に含まれる"SA"/"PA"表記からエリア種別を判定する(バックエンドに区分データが無いための簡易判定)
// 例: "前沢PA（上り）"のように方向表記が付く名前も想定し、末尾一致ではなく部分一致で判定する
function getAreaType(name: string): AreaType {
  if (name.includes("SA")) return "SA";
  if (name.includes("PA")) return "PA";
  return "other";
}

type SortOrder = "none" | "asc" | "desc";

type ParkListClientProps = {
  parkings: ParkingStatus[];
};

export default function ParkListClient({ parkings }: ParkListClientProps) {
  // 検索条件用のstate
  const [areaType, setAreaType] = useState("none");
  const [areaName, setAreaName] = useState("");
  const [keyword, setKeyword] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");

  // 検索実行時
  const handleSearch = () => {
    setKeyword(areaName);
  };

  // 表示データをフィルタリング
  const filteredData = parkings.filter((item) => {
    // エリア種別のフィルタ(完全一致)
    const matchType = areaType === "none" ? true : getAreaType(item.name) === areaType;

    // エリア名のフィルタ（部分一致）
    const matchName = keyword === "" ? true : item.name.includes(keyword);

    return matchType && matchName;
  });

  // 名前順の並び替え
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortOrder === "none") return 0;
    const compared = a.name.localeCompare(b.name, "ja");
    return sortOrder === "asc" ? compared : -compared;
  });

  return (
    <>
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
        {/* 並び替え */}
        <div className="sort-selection flex flex-col gap-2">
          <h3 className="text-xs font-bold">並び替え</h3>
          <select
            className="sort-select text-xs border rounded-sm p-1 border-gray-300 w-32"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
          >
            <option value="none">指定なし</option>
            <option value="asc">名前順(昇順)</option>
            <option value="desc">名前順(降順)</option>
          </select>
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
      {sortedData.length > 0 ? (
          sortedData.map((item) => (
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
    </>
  );
}
