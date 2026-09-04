"use client";
import { useEffect, useMemo, useState } from "react";
import ParkInfo from "./parkInfo";
import ParkMap from "./parkMap/parkMap";
import ParkPhotoMap from "./parkMap/parkPhotoMap";
import { buildParkingRows, RowLayout } from "./parkMap/buildParkingRows";
import { calcVehicleCounts } from "./parkMap/calcVehicleCounts";
import { calcVehicleCountsFromSpaces } from "./parkMap/calcVehicleCountsFromSpaces";
import { buildImageUrl } from "./parkMap/buildImageUrl";
import { FacilityKey } from "./facilityIcons";
import { ParkingSpace, ParkingStatus } from "../../../types/parking";

// 満空状況を定期的に自動更新する間隔(ミリ秒)
const POLLING_INTERVAL_MS = 1000;

type ParkInfoClientProps = {
  parkingId: number;
  saName: string;
  facilities: Record<FacilityKey, boolean>;
  // 前沢PA上り/下り以外はレイアウト定義を持たない(undefined)。その場合は写真+検出データ表示に切り替える
  rowLayout?: RowLayout[];
  flipped: boolean;
  // 写真表示用のDB登録画像パス。前沢PA上り/下りや未登録時はnull
  imagePath: string | null;
  initialSpaces: ParkingSpace[];
  // 戻るボタンの遷移先。省略時は一般利用者向け一覧に戻る
  backHref?: string;
};

// 指定した駐車場の現在状況を取得する。取得に失敗した場合はnullを返す
// クライアント側(ブラウザ)で実行されるためNEXT_PUBLIC_API_URLを使う
async function fetchParkingStatus(parkingId: number): Promise<ParkingStatus | null> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
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

export default function ParkInfoClient({
  parkingId,
  saName,
  facilities,
  rowLayout,
  flipped,
  imagePath,
  initialSpaces,
  backHref,
}: ParkInfoClientProps) {
  const [spaces, setSpaces] = useState(initialSpaces);

  // ページをリロードしなくても満空状況が反映されるよう、一定間隔でバックエンドを再取得する
  useEffect(() => {
    const timerId = setInterval(async () => {
      const status = await fetchParkingStatus(parkingId);
      // 取得失敗時は直前の表示状態を維持し、空表示にはしない
      if (status) {
        setSpaces(status.spaces);
      }
    }, POLLING_INTERVAL_MS);

    return () => clearInterval(timerId);
  }, [parkingId]);

  // 前沢PA上り/下り(rowLayoutあり)は模式図、それ以外は写真+検出データで表示する
  const isSchematic = rowLayout !== undefined;

  const parkingRows = useMemo(
    () => (isSchematic ? buildParkingRows(spaces, rowLayout) : []),
    [isSchematic, spaces, rowLayout]
  );
  const schematicCounts = useMemo(() => calcVehicleCounts(parkingRows), [parkingRows]);
  const photoCounts = useMemo(() => calcVehicleCountsFromSpaces(spaces), [spaces]);
  const { capacity, available } = isSchematic ? schematicCounts : photoCounts;

  const imageUrl = useMemo(() => buildImageUrl(imagePath), [imagePath]);

  return (
    <>
      <ParkInfo saName={saName} capacity={capacity} available={available} facilities={facilities} backHref={backHref} />
      {isSchematic ? (
        // 下りは実際の走行方向に合わせてマップを上下左右反転(180度回転)して表示する
        <ParkMap rows={parkingRows} flipped={flipped} />
      ) : imageUrl ? (
        <ParkPhotoMap imageUrl={imageUrl} spaces={spaces} />
      ) : (
        <p className="px-4 py-6 text-center text-xs text-gray-500">駐車場の写真が登録されていません。</p>
      )}
    </>
  );
}
