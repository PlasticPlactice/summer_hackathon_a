"use client";
import { useEffect, useMemo, useState } from "react";
import ParkInfo from "./parkInfo";
import ParkMap from "./parkMap/parkMap";
import { buildParkingRows, RowLayout } from "./parkMap/buildParkingRows";
import { calcVehicleCounts } from "./parkMap/calcVehicleCounts";
import { FacilityKey } from "./facilityIcons";
import { ParkingSpace, ParkingStatus } from "../../../types/parking";

// 満空状況を定期的に自動更新する間隔(ミリ秒)
const POLLING_INTERVAL_MS = 5000;

type ParkInfoClientProps = {
  parkingId: number;
  saName: string;
  facilities: Record<FacilityKey, boolean>;
  rowLayout: RowLayout[];
  flipped: boolean;
  initialSpaces: ParkingSpace[];
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
  initialSpaces,
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

  const parkingRows = useMemo(() => buildParkingRows(spaces, rowLayout), [spaces, rowLayout]);
  const { capacity, available } = useMemo(() => calcVehicleCounts(parkingRows), [parkingRows]);

  return (
    <>
      <ParkInfo saName={saName} capacity={capacity} available={available} facilities={facilities} />
      {/* 下りは実際の走行方向に合わせてマップを上下左右反転(180度回転)して表示する */}
      <ParkMap rows={parkingRows} flipped={flipped} />
    </>
  );
}
