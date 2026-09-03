"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ExplanatoryNotes from "../explanatoryNotes";
import AreaListItem from "../areaListItem/areaListItem";
import ConfirmModal from "../confirmModal/confirmModal";
import Pagination from "../pagination/pagination";
import { ParkingStatus } from "../../../types/parking";

// 1ページに表示する件数
const PAGE_SIZE = 10;

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
  // 管理者向け操作(編集・削除ボタン)を表示するかどうか。省略時は一般利用者向け画面のまま
  isAdmin?: boolean;
};

export default function ParkListClient({ parkings, isAdmin = false }: ParkListClientProps) {
  const router = useRouter();
  // 検索条件用のstate
  const [areaType, setAreaType] = useState("none");
  const [areaName, setAreaName] = useState("");
  const [keyword, setKeyword] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("none");

  // 現在のページ番号
  const [currentPage, setCurrentPage] = useState(1);

  // 削除確認モーダルの対象(nullなら非表示)
  const [deleteTarget, setDeleteTarget] = useState<ParkingStatus | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // 検索実行時
  const handleSearch = () => {
    setKeyword(areaName);
    setCurrentPage(1);
  };

  // 削除確定時: バックエンドのDELETE /api/v1/parkings/{id}を呼び出す
  const handleConfirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }
    setIsDeleting(true);
    setDeleteError(null);

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/parkings/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        console.error(`駐車場の削除に失敗しました: ${res.status}`);
        setDeleteError("削除に失敗しました。再度お試しください。");
        setIsDeleting(false);
        return;
      }
      setDeleteTarget(null);
      setIsDeleting(false);
      router.refresh();
    } catch (error) {
      console.error("駐車場の削除中にエラーが発生しました", error);
      setDeleteError("削除中にエラーが発生しました。通信環境を確認して再度お試しください。");
      setIsDeleting(false);
    }
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

  const totalPages = Math.max(1, Math.ceil(sortedData.length / PAGE_SIZE));
  // 削除等でページ数が減った場合に範囲外にならないよう補正する
  const safePage = Math.min(currentPage, totalPages);
  const pagedData = sortedData.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

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
            onChange={(e) => {
              setAreaType(e.target.value);
              setCurrentPage(1);
            }}
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
            onChange={(e) => {
              setSortOrder(e.target.value as SortOrder);
              setCurrentPage(1);
            }}
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
      {pagedData.length > 0 ? (
          pagedData.map((item) => (
            <AreaListItem
              key={item.id}
              parking={item}
              parkingTotalNumLarge={item.large_capacity}
              parkingTotalNumsmall={item.compact_capacity}
              isAdmin={isAdmin}
              onDeleteRequest={setDeleteTarget}
            />
          ))
        ) : (
          <p className="text-xs text-gray-500">該当するエリアがありません</p>
        )}
      </div>
      <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} />
      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="駐車場の削除"
        message={deleteTarget ? `「${deleteTarget.name}」を削除します。この操作は取り消せません。よろしいですか?` : ""}
        isProcessing={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
      />
      {deleteError && <p className="text-xs text-red-500">{deleteError}</p>}
    </>
  );
}
