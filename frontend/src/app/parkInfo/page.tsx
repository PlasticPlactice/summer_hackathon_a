import ParkInfo from "../component/parkInfo/parkInfo";
import ParkMap from "../component/parkInfo/parkMap/parkMap";
import { buildParkingRows, RowLayout } from "../component/parkInfo/parkMap/buildParkingRows";
import { calcVehicleCounts } from "../component/parkInfo/parkMap/calcVehicleCounts";
import { ParkingSpace } from "../../types/parking";

// SA名
const saName = "前沢SA";

type Direction = "up" | "down";

// 上り/下りと、対応する駐車場id(バックエンドのDB初期データでは 上り=1, 下り=2 として登録されている)
const PARKING_ID_BY_DIRECTION: Record<Direction, number> = {
  up: 1,
  down: 2,
};

// 駐車場の列ごとの構成。行のtype(car/track)と各枠数のみ定義する(表示レイアウト専用の情報)
// 実際の満車状況・idはバックエンドから取得したParkingSpace[]を先頭から順に割り当てる
// 合計枚数は各方向の実データ(上り: compact79/large22, 下り: compact79/large26)に合わせている
// 列は何行でも追加可能(例: 車列を複数にする、トラック列を増やす等)
const ROW_LAYOUT_BY_DIRECTION: Record<Direction, RowLayout[]> = {
  up: [
    { type: "car", slotCount: 17 },
    { type: "car", slotCount: 17 },
    { type: "car", slotCount: 15 },
    { type: "car", slotCount: 15 },
    { type: "car", slotCount: 15 },
    { type: "track", slotCount: 11 },
    { type: "track", slotCount: 11 },
  ],
  down: [
    { type: "car", slotCount: 17 },
    { type: "car", slotCount: 17 },
    { type: "car", slotCount: 15 },
    { type: "car", slotCount: 15 },
    { type: "car", slotCount: 15 },
    { type: "track", slotCount: 13 },
    { type: "track", slotCount: 13 },
  ],
};

// SAごとの設置施設の有無(将来複数SA/PAを扱う際はSAごとにこの設定を用意する)
const facilities = {
  parking: true,
  toilet: true,
  food: true,
  gasStation: true,
  info: true,
  bed: false,
};

// バックエンドから駐車スペース一覧を取得する。取得に失敗した場合は空配列を返す
// このfetchはNext.jsサーバー側(=Dockerではfrontendコンテナ内)で実行されるため、
// ブラウザ向けのNEXT_PUBLIC_API_URLではなく、コンテナ間通信用のAPI_INTERNAL_URLを優先して使う
async function fetchParkingSpaces(): Promise<ParkingSpace[]> {
  const apiBaseUrl = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL;
  try {
    const res = await fetch(`${apiBaseUrl}/api/v1/spaces`, {
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`駐車スペースの取得に失敗しました: ${res.status}`);
      return [];
    }
    return (await res.json()) as ParkingSpace[];
  } catch (error) {
    console.error("駐車スペースの取得中にエラーが発生しました", error);
    return [];
  }
}

type ParkInfoPageProps = {
  searchParams: Promise<{ dir?: string }>;
};

export default async function ParkInfoPage({ searchParams }: ParkInfoPageProps) {
  // ?dir=down のときだけ下り、それ以外(未指定・不正値含む)は上りを表示する
  const { dir } = await searchParams;
  const direction: Direction = dir === "down" ? "down" : "up";

  const spaces = await fetchParkingSpaces();
  // 表示対象の駐車場(上り/下り)のスペースのみに絞り込む
  const targetSpaces = spaces.filter(
    (space) => space.parking_id === PARKING_ID_BY_DIRECTION[direction]
  );
  const parkingRows = buildParkingRows(targetSpaces, ROW_LAYOUT_BY_DIRECTION[direction]);

  // 駐車場規模と現在の空き台数(車種別)はparkingRowsから算出する
  const { capacity, available } = calcVehicleCounts(parkingRows);

  return (
    <main  className="overflow-x-hidden">
      <ParkInfo
        saName={saName}
        direction={direction}
        capacity={capacity}
        available={available}
        facilities={facilities}
      />
      {/* 下りは実際の走行方向に合わせてマップを上下左右反転(180度回転)して表示する */}
      <ParkMap rows={parkingRows} flipped={direction === "down"} />
    </main>
  );
}