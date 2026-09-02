import Link from "next/link";
import SensorListClient from "../../component/sensors/sensorListClient";
import { ParkingStatus, Sensor } from "../../../types/parking";

// バックエンドからセンサー一覧を取得する。取得に失敗した場合は空配列を返す
// このfetchはNext.jsサーバー側(=Dockerではfrontendコンテナ内)で実行されるため、
// ブラウザ向けのNEXT_PUBLIC_API_URLではなく、コンテナ間通信用のAPI_INTERNAL_URLを優先して使う
async function fetchSensors(): Promise<Sensor[]> {
  const apiBaseUrl = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL;
  try {
    const res = await fetch(`${apiBaseUrl}/api/v1/sensors`, {
      cache: "no-store",
    });
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

// センサーがどのパーキング・スペースに紐付いているかを求めるため、駐車場一覧(スペース込み)も取得する
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

export default async function AdminSensorsPage() {
  const [sensors, parkings] = await Promise.all([fetchSensors(), fetchParkings()]);

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
        <h1 className="px-4 text-base font-bold text-black">センサー管理</h1>
      </div>
      <SensorListClient initialSensors={sensors} parkings={parkings} />
    </main>
  );
}
