"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ParkingStatus } from "../../../types/parking";

type EditParkingClientProps = {
  parking: ParkingStatus;
};

export default function EditParkingClient({ parking }: EditParkingClientProps) {
  const router = useRouter();

  // 駐車場名の入力
  const [name, setName] = useState(parking.name);
  // 大型車の駐車可能台数
  const [largeCapacity, setLargeCapacity] = useState(String(parking.large_capacity));
  // 小型車の駐車可能台数
  const [smallCapacity, setSmallCapacity] = useState(String(parking.compact_capacity));

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 「更新する」ボタンを活性化する条件(すべての必須項目が入力されているか)
  const canSubmit = name !== "" && largeCapacity !== "" && smallCapacity !== "";

  // 入力内容でバックエンドの駐車場情報を更新する
  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }
    setErrorMessage(null);
    setIsSaving(true);

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
    const body = {
      name,
      capacity: Number(smallCapacity) + Number(largeCapacity),
      compact_capacity: Number(smallCapacity),
      large_capacity: Number(largeCapacity),
      // バックエンドのPUTは未指定フィールドをNoneで上書きするため、既存の画像パスをそのまま送り直す
      image_path: parking.image_path,
    };

    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/parkings/${parking.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        console.error(`駐車場の更新に失敗しました: ${res.status}`);
        setErrorMessage("駐車場の更新に失敗しました。内容を確認して再度お試しください。");
        setIsSaving(false);
        return;
      }
      router.push("/admin/parkList");
    } catch (error) {
      console.error("駐車場の更新中にエラーが発生しました", error);
      setErrorMessage("駐車場の更新中にエラーが発生しました。通信環境を確認して再度お試しください。");
      setIsSaving(false);
    }
  };

  return (
    <div className="flex w-full max-w-[390px] flex-col gap-5">
      {/* 戻るボタン */}
      <Link href="/admin/parkList" className="flex items-center gap-2 px-4 py-3 text-black">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-xs">戻る</span>
      </Link>
      {/* パーキング名 */}
      <section className="flex flex-col gap-3 px-4">
        <h2 className="text-base text-black">
          パーキングの名前<span className="text-red-500">*</span>
        </h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
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

      {errorMessage && <p className="px-4 text-xs text-red-500">{errorMessage}</p>}

      <div className="mt-2 flex justify-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/parkList")}
          disabled={isSaving}
          className="h-[35px] w-[100px] cursor-pointer rounded-[5px] border border-[#a1a1a1] bg-white text-xs font-bold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          キャンセル
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || isSaving}
          className="h-[35px] w-[150px] cursor-pointer rounded-[5px] border border-[#3cff00] bg-[#d5fbcd] text-xs font-bold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSaving ? "更新中..." : "更新する"}
        </button>
      </div>
    </div>
  );
}
