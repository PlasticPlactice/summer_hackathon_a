"use client";

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isProcessing?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

// 削除など、取り消しできない操作の前に表示する確認モーダル
export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "削除する",
  cancelLabel = "キャンセル",
  isProcessing = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="flex w-full max-w-[320px] flex-col gap-4 rounded-[5px] bg-white p-5">
        <h2 className="text-base font-bold text-black">{title}</h2>
        <p className="text-xs text-black">{message}</p>
        <div className="mt-2 flex justify-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="h-[35px] w-[100px] cursor-pointer rounded-[5px] border border-[#a1a1a1] bg-white text-xs font-bold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className="h-[35px] w-[100px] cursor-pointer rounded-[5px] border border-[#e20000] bg-[#fbcdcd] text-xs font-bold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isProcessing ? "削除中..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
