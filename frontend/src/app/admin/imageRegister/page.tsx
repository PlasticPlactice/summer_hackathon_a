"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";

export default function ImageRegisterPage() {
  // 駐車場名の入力
  const [parking, setParking] = useState("");
  // 大型車の駐車可能台数
  const [largeCapacity, setLargeCapacity] = useState("");
  // 小型車の駐車可能台数
  const [smallCapacity, setSmallCapacity] = useState("");
  // 選択された画像ファイル
  const [file, setFile] = useState<File | null>(null);
  // ドラッグ中かどうか
  const [isDragging, setIsDragging] = useState(false);
  // 確認事項へのチェック
  const [confirmed, setConfirmed] = useState(false);
  // ファイル選択inputへの参照(削除時に選択状態をリセットし、同じファイルを選び直せるようにする)
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 登録ボタンを活性化する条件(すべての必須項目が入力・選択されているか)
  const canRegister =
    parking !== "" &&
    largeCapacity !== "" &&
    smallCapacity !== "" &&
    file !== null &&
    confirmed;

  const handleFiles = (files: FileList | null) => {
    if (files && files[0]) {
      setFile(files[0]);
    }
  };

  // 選択中の画像を削除する
  const handleRemoveFile = (e: MouseEvent<HTMLButtonElement>) => {
    // labelタグ内のボタンのため、ファイル選択ダイアログが開かないようにする
    e.preventDefault();
    e.stopPropagation();
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // プレビュー用URLはfileから導出できる値なのでstateではなくuseMemoで算出する
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  // 発行したプレビュー用URLは不要になったタイミングで解放する
  useEffect(() => {
    if (!previewUrl) {
      return;
    }
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  return (
    <main className="flex w-full flex-col items-center bg-white pb-10">
      <div className="flex w-full max-w-[390px] flex-col gap-5">
        {/* 戻るボタン */}
        <Link href="/admin" className="flex items-center gap-2 px-4 py-3 text-black">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xs">戻る</span>
        </Link>
        {/* 登録するパーキング名 */}
        <section className="flex flex-col gap-3 px-4">
          <h2 className="text-base text-black">
            パーキングの名前<span className="text-red-500">*</span>
          </h2>
          <input
            type="text"
            value={parking}
            onChange={(e) => setParking(e.target.value)}
            placeholder="例：東北自動車道 - 前沢SA（上り）"
            className="w-full rounded-[5px] border border-[#a1a1a1] px-2 py-1 text-xs text-black placeholder:text-[#a1a1a1]"
          />
        </section>
        {/* パーキングの駐車場規模 */}
        <section className="flex flex-col gap-3 px-4">
          <h2 className="text-base text-black">
            パーキングの駐車場規模<span className="text-red-500">*</span>
          </h2>
          <section>
            <label className="text-xs text-black font-bold">
              大型車(バス、大型トラック)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={largeCapacity}
                onChange={(e) => setLargeCapacity(e.target.value)}
                placeholder="例：100"
                className="w-full rounded-[5px] border border-[#a1a1a1] px-2 py-1 text-xs text-black placeholder:text-[#a1a1a1]"
              />
              <p className="text-xs text-black">台</p>
            </div>
          </section>
          <section>
            <label className="text-xs text-black font-bold">
              小型車(一般車、軽自動車)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={smallCapacity}
                onChange={(e) => setSmallCapacity(e.target.value)}
                placeholder="例：100"
                className="w-full rounded-[5px] border border-[#a1a1a1] px-2 py-1 text-xs text-black placeholder:text-[#a1a1a1]"
              />
              <p className="text-xs text-black">台</p>
            </div>
          </section>
        </section>
        {/* 駐車場の写真をインポート */}
        <section className="flex flex-col gap-3 px-4">
          <h2 className="text-base text-black">
            駐車場の写真をインポート<span className="text-red-500">*</span>
          </h2>
          <p className="text-xs text-black">読み込ませたい駐車場の写真を選択してください。</p>

          <label
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFiles(e.dataTransfer.files);
            }}
            className={`flex h-96 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-[5px] border px-4 text-center ${
              isDragging ? "border-[#0095ff]" : "border-[#d9d9d9]"
            }`}
          >
            {previewUrl ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element -- ローカル選択ファイルのプレビューのためblob URLをそのまま表示する */}
                <img src={previewUrl} alt="選択した画像のプレビュー" className="max-h-48 w-auto rounded-[5px] object-contain" />
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  aria-label="選択した画像を削除"
                  className="absolute -top-2 -right-2 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border border-[#a1a1a1] bg-white text-xs leading-none text-black hover:bg-[#f5f5f5]"
                >
                  ×
                </button>
              </div>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a1a1a1" strokeWidth="2">
                <path d="M12 16V4M7 9l5-5 5 5M5 20h14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {file ? (
              <p className="text-base font-bold break-all text-black">{file.name}</p>
            ) : (
              <p className="text-base font-bold text-[#a1a1a1]">画像をドラッグ＆ドロップ</p>
            )}
            <p className="text-xs text-[#a1a1a1]">または</p>
            <span className="rounded-[5px] border border-[#0095ff] bg-white px-4 py-1 text-xs text-[#0095ff]">
              ファイルを選択
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.svg"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <p className="text-xs text-[#a1a1a1]">*.jpg、*.png、*.webp、*.svg</p>
          </label>

          {/* 注意書き */}
          <div className="flex flex-col gap-2 rounded-[5px] border border-[#ffed2c] bg-[#fffde6] px-3 py-2">
            <p className="text-xs text-[#231f20]">※以下のことを確認してください！</p>
            <p className="text-xs leading-relaxed text-black">
              1.解像度が高い
              <br />
              2.駐車枠がぼやけてない
            </p>
          </div>

          {/* 確認チェック */}
          <label className="flex items-center gap-2 text-xs text-black">
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
            上記のことを確認しました。
          </label>

          {/* 登録するボタン(色は/admin/page.tsxのパーキング一覧ボタンに合わせる) */}
          <button
            type="button"
            disabled={!canRegister}
            className="mt-2 h-[35px] w-[150px] cursor-pointer self-center rounded-[5px] border border-[#3cff00] bg-[#d5fbcd] text-xs font-bold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            登録する
          </button>
        </section>
      </div>
    </main>
  );
}
