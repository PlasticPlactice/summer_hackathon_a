"use client";
import ExplanatoryNotes from "./component/explanatoryNotes";
import AreaListItem from "./component/areaListItem/areaListItem";
import { useState } from "react";

// ダミーのデータ
const MOCK_DATA = [
  {
    id: 1,
    title: "前沢SA",
    color: "#FFBC4C",
    parkingTotalNumLarge: 48,
    parkingTotalNumsmall: 158,
    parkingUsedNumLarge: 20,
    parkingUsedNumsmall: 74,
    areaType: "SA"
  },
  {
    id: 2,
    title: "紫波SA",
    color: "#80FFEC",
    parkingTotalNumLarge: 82,
    parkingTotalNumsmall: 176,
    parkingUsedNumLarge: 5,
    parkingUsedNumsmall: 5,
    areaType: "SA"
  },
  {
    id: 3,
    title: "岩手山SA",
    color: "#FFBC4C",
    parkingTotalNumLarge: 64,
    parkingTotalNumsmall: 182,
    parkingUsedNumLarge: 30,
    parkingUsedNumsmall: 91,
    areaType: "SA"
  },
  {
    id: 4,
    title: "矢巾PA",
    color: "#FF4E51",
    parkingTotalNumLarge: 24,
    parkingTotalNumsmall: 62,
    parkingUsedNumLarge: 24,
    parkingUsedNumsmall: 62,
    areaType: "PA"
  },
  {
    id: 5,
    title: "滝沢SA",
    color: "#80FFEC",
    parkingTotalNumLarge: 51,
    parkingTotalNumsmall: 36,
    parkingUsedNumLarge: 5,
    parkingUsedNumsmall: 5,
    areaType: "SA"
  },
  {
    id: 6,
    title: "上河内SA",
    color: "#80FFEC",
    parkingTotalNumLarge: 98,
    parkingTotalNumsmall: 239,
    parkingUsedNumLarge: 5,
    parkingUsedNumsmall: 5,
    areaType: "SA"
  }
]

export default function Home() {
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
    const matchName = keyword === "" ? true : item.title.includes(keyword);

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
        <ExplanatoryNotes label="空き" color="#80FFEC" />
        <ExplanatoryNotes label="混雑" color="#FFBC4C" />
        <ExplanatoryNotes label="満車" color="#FF4E51" />
      </div>
      {/* エリア一覧 */}
      <div className="area-list flex flex-wrap justify-between gap-5">
      {filteredData.length > 0 ? (
          filteredData.map((item) => (
            <AreaListItem
              key={item.id}
              title={item.title}
              color={item.color}
              parkingTotalNumLarge={item.parkingTotalNumLarge}
              parkingTotalNumsmall={item.parkingTotalNumsmall}
              parkingUsedNumLarge={item.parkingUsedNumLarge}
              parkingUsedNumsmall={item.parkingUsedNumsmall}
            />
          ))
        ) : (
          <p className="text-xs text-gray-500">該当するエリアがありません</p>
        )}
      </div>
    </main>
  );
}
