import Link from "next/link";
import { notFound } from "next/navigation";
import SpaceSensorAssignClient from "../../../../component/sensors/spaceSensorAssignClient";
import { ParkingSpace, ParkingStatus, Sensor } from "../../../../../types/parking";

// バックエンドから指定IDの駐車場情報(スペース込み)を取得する。存在しない場合はnullを返す
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

async function fetchSensors(): Promise<Sensor[]> {
  const apiBaseUrl = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL;
  try {
    const res = await fetch(`${apiBaseUrl}/api/v1/sensors`, { cache: "no-store" });
    if (!res.ok) {
      console.error(`センサー一覧の取得に失敗しました: ${res.status}`);
      return [];
    }
    return (await res.json()) as Sensor[];
  } catch (error) {
    console.error("センサー一覧の取得中にエラーが発生しました", error);
    return [];
  }
}

// システム全体でどのセンサーが既にスペースに紐付き済みかを知るため、全スペースを取得する
async function fetchAllSpaces(): Promise<ParkingSpace[]> {
  const apiBaseUrl = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL;
  try {
    const res = await fetch(`${apiBaseUrl}/api/v1/spaces`, { cache: "no-store" });
    if (!res.ok) {
      console.error(`駐車スペース一覧の取得に失敗しました: ${res.status}`);
      return [];
    }
    return (await res.json()) as ParkingSpace[];
  } catch (error) {
    console.error("駐車スペース一覧の取得中にエラーが発生しました", error);
    return [];
  }
}

export default async function ParkingSensorsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [parking, sensors, allSpaces] = await Promise.all([
    fetchParking(id),
    fetchSensors(),
    fetchAllSpaces(),
  ]);

  if (!parking) {
    notFound();
  }

  const usedSensorIds = allSpaces
    .filter((s) => s.sensor_id !== null)
    .map((s) => s.sensor_id as number);

  return (
    <main className="flex w-full flex-col items-center bg-white pb-10">
      <div className="flex w-full max-w-[390px] flex-col gap-5">
        {/* 戻るボタン */}
        <Link href="/admin/parkList" className="flex items-center gap-2 px-4 py-3 text-black">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xs">戻る</span>
        </Link>
      </div>
      <SpaceSensorAssignClient
        parkingId={parking.id}
        parkingName={parking.name}
        initialSpaces={parking.spaces}
        initialSensors={sensors}
        initialUsedSensorIds={usedSensorIds}
      />
    </main>
  );
}
