import ParkInfoClient from "../component/parkInfo/parkInfoClient";
import { RowLayout } from "../component/parkInfo/parkMap/buildParkingRows";
import { ParkingStatus } from "../../types/parking";

// 駐車場idごとのレイアウト設定(バックエンドにレイアウト情報は無いためフロント側で保持する)
// rowLayout: 列ごとの構成(行のtype(car/track)と各枠数)。実際の満車状況・idはバックエンドから
// 取得したParkingSpace[]を先頭から順に割り当てる(合計枚数は各駐車場の実データに合わせている)
// flipped: マップを上下左右反転して表示するか(下り方向の駐車場で使用)
type ParkingLayoutConfig = {
  rowLayout: RowLayout[];
  flipped: boolean;
};

// バックエンドのDB初期データでは 前沢PA上り=id1, 前沢PA下り=id2 として登録されている
const PARKING_LAYOUT_CONFIG: Record<number, ParkingLayoutConfig> = {
  1: {
    rowLayout: [
      { type: "car", slotCount: 17 },
      { type: "car", slotCount: 17 },
      { type: "car", slotCount: 15 },
      { type: "car", slotCount: 15 },
      { type: "car", slotCount: 15 },
      { type: "track", slotCount: 11 },
      { type: "track", slotCount: 11 },
    ],
    flipped: false,
  },
  2: {
    rowLayout: [
      { type: "car", slotCount: 17 },
      { type: "car", slotCount: 17 },
      { type: "car", slotCount: 15 },
      { type: "car", slotCount: 15 },
      { type: "car", slotCount: 15 },
      { type: "track", slotCount: 13 },
      { type: "track", slotCount: 13 },
    ],
    flipped: true,
  },
};

// デフォルトで表示する駐車場id(parkingId未指定・不正値の場合のフォールバック)
const DEFAULT_PARKING_ID = 1;

// SAごとの設置施設の有無(将来複数SA/PAを扱う際はSAごとにこの設定を用意する)
const facilities = {
  parking: true,
  toilet: true,
  food: true,
  gasStation: true,
  info: true,
  bed: false,
};

// バックエンドから指定した駐車場の現在状況を取得する。取得に失敗した場合はnullを返す
// このfetchはNext.jsサーバー側(=Dockerではfrontendコンテナ内)で実行されるため、
// ブラウザ向けのNEXT_PUBLIC_API_URLではなく、コンテナ間通信用のAPI_INTERNAL_URLを優先して使う
async function fetchParkingStatus(parkingId: number): Promise<ParkingStatus | null> {
  const apiBaseUrl = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL;
  try {
    const res = await fetch(`${apiBaseUrl}/api/v1/parkings/${parkingId}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`駐車場情報の取得に失敗しました: ${res.status}`);
      return null;
    }
    return (await res.json()) as ParkingStatus;
  } catch (error) {
    console.error("駐車場情報の取得中にエラーが発生しました", error);
    return null;
  }
}

type ParkInfoPageProps = {
  searchParams: Promise<{ parkingId?: string }>;
};

export default async function ParkInfoPage({ searchParams }: ParkInfoPageProps) {
  // parkingId未指定・数値変換できない値の場合はDEFAULT_PARKING_IDにフォールバックする
  const { parkingId: parkingIdParam } = await searchParams;
  const parsedParkingId = Number(parkingIdParam);
  const parkingId =
    parkingIdParam && Number.isInteger(parsedParkingId) && parsedParkingId > 0
      ? parsedParkingId
      : DEFAULT_PARKING_ID;

  // レイアウト設定が無いid(未登録の駐車場)の場合もDEFAULT_PARKING_IDの設定で表示する
  const layoutConfig = PARKING_LAYOUT_CONFIG[parkingId] ?? PARKING_LAYOUT_CONFIG[DEFAULT_PARKING_ID];

  const status = await fetchParkingStatus(parkingId);

  return (
    <main className="overflow-x-hidden">
      <ParkInfoClient
        parkingId={parkingId}
        saName={status?.name ?? "駐車場"}
        facilities={facilities}
        rowLayout={layoutConfig.rowLayout}
        flipped={layoutConfig.flipped}
        initialSpaces={status?.spaces ?? []}
      />
    </main>
  );
}