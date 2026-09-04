import Link from "next/link";
import ParkListClient from "../../component/parkList/parkListClient";
import { ParkingStatus } from "../../../types/parking";

// バックエンドから駐車場一覧(現在状況込み)を取得する。取得に失敗した場合は空配列を返す
// このfetchはNext.jsサーバー側(=Dockerではfrontendコンテナ内)で実行されるため、
// ブラウザ向けのNEXT_PUBLIC_API_URLではなく、コンテナ間通信用のAPI_INTERNAL_URLを優先して使う
async function fetchParkings(): Promise<ParkingStatus[]> {
  const apiBaseUrl = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL;
  try {
    const res = await fetch(`${apiBaseUrl}/api/v1/parkings`, {
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`駐車場一覧の取得に失敗しました: ${res.status}`);
      return [];
    }
    return (await res.json()) as ParkingStatus[];
  } catch (error) {
    console.error("駐車場一覧の取得中にエラーが発生しました", error);
    return [];
  }
}

export default async function AdminParkListPage() {
  const parkings = await fetchParkings();

  return (
    <main className="p-4 flex flex-col gap-4">
      {/* 戻るボタン */}
      <Link href="/admin/home" className="flex items-center gap-2 text-black">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-xs">戻る</span>
      </Link>
      <ParkListClient parkings={parkings} isAdmin />
    </main>
  );
}
