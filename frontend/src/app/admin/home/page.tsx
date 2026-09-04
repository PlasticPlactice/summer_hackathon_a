"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminPage() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // ログアウトボタン押下時: バックエンドのPOST /auth/logoutを呼び出してセッションを破棄する
  const handleLogout = async () => {
    setIsLoggingOut(true);

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

    try {
      await fetch(`${apiBaseUrl}/api/v1/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error(`ログアウトに失敗しました: ${err}`);
    } finally {
      setIsLoggingOut(false);
      router.push("/admin");
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-white pt-16">
      <h2 className="text-base font-bold text-black">操作一覧</h2>
      <div className="mt-11 flex w-[246px] flex-col gap-11">
        <Link
          href="/admin/parkList"
          className="flex h-[53px] cursor-pointer items-center justify-center rounded-[5px] border border-[#3cff00] bg-[#d5fbcd] text-base text-black transition-opacity hover:opacity-90"
        >
          パーキング一覧
        </Link>
        <Link
          href="/admin/imageRegister"
          className="flex h-[53px] cursor-pointer items-center justify-center rounded-[5px] border border-[#cfbe00] bg-[#fbf7cd] text-base text-black transition-opacity hover:opacity-90"
        >
          パーキングの登録
        </Link>
        <Link
          href="/admin/sensors"
          className="flex h-[53px] cursor-pointer items-center justify-center rounded-[5px] border border-[#0095ff] bg-[#cde9fb] text-base text-black transition-opacity hover:opacity-90"
        >
          センサー管理
        </Link>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="mt-52 flex h-[53px] w-[246px] cursor-pointer items-center justify-center rounded-[5px] border border-[#ff3c3c] bg-[#fbd5d5] text-base text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        ログアウト
      </button>
    </main>
  );
}
