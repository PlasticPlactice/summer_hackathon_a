"use client";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

// 一覧画面共通のページ送りUI。全体が1ページに収まる場合は何も表示しない
export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="pagination flex items-center justify-center gap-4 text-xs">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="cursor-pointer rounded-sm border border-gray-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-40"
      >
        前へ
      </button>
      <span className="text-gray-600">
        {currentPage} / {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="cursor-pointer rounded-sm border border-gray-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-40"
      >
        次へ
      </button>
    </div>
  );
}
