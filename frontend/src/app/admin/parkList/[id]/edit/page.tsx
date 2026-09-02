import { notFound } from "next/navigation";
import EditParkingClient from "../../../../component/parkList/editParkingClient";
import { ParkingStatus } from "../../../../../types/parking";

// バックエンドから指定IDの駐車場情報を取得する。存在しない場合はnullを返す
// このfetchはNext.jsサーバー側(=Dockerではfrontendコンテナ内)で実行されるため、
// ブラウザ向けのNEXT_PUBLIC_API_URLではなく、コンテナ間通信用のAPI_INTERNAL_URLを優先して使う
async function fetchParking(id: string): Promise<ParkingStatus | null> {
  const apiBaseUrl = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL;
  try {
    const res = await fetch(`${apiBaseUrl}/api/v1/parkings/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      if (res.status !== 404) {
        console.error(`駐車場情報の取得に失敗しました: ${res.status}`);
      }
      return null;
    }
    return (await res.json()) as ParkingStatus;
  } catch (error) {
    console.error("駐車場情報の取得中にエラーが発生しました", error);
    return null;
  }
}

export default async function EditParkingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parking = await fetchParking(id);

  if (!parking) {
    notFound();
  }

  return (
    <main className="flex w-full flex-col items-center bg-white pb-10">
      <EditParkingClient parking={parking} />
    </main>
  );
}
