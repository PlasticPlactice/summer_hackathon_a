"use client";
import { useState, type SyntheticEvent } from "react";
import ParkingSlotCar from "./parkingSlotCar";
import ParkingSlotTrack from "./parkingSlotTrack";
import { ParkingSpace } from "../../../../types/parking";

interface ParkPhotoMapProps {
  imageUrl: string;
  spaces: ParkingSpace[];
}

// 前沢PA以外の駐車場向け: DBに登録された写真をそのまま表示し、YOLOで検出した
// 駐車枠の座標(x, y, width, height)を実際のstatusで色分けして重ねて表示する
function ParkPhotoMap({ imageUrl, spaces }: ParkPhotoMapProps) {
  // 座標はimg要素の実サイズ(naturalWidth/Height)に対する%に変換するため、
  // 読み込み完了まで待ってから重ねる枠を描画する
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);

  const handleLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
  };

  return (
    <div className="w-full overflow-x-hidden">
      <div className="relative w-full">
        {/* eslint-disable-next-line @next/next/no-img-element -- バックエンドが配信するアップロード画像をそのまま表示する */}
        <img
          src={imageUrl}
          alt="駐車場の様子"
          onLoad={handleLoad}
          className="w-full h-auto object-contain"
        />
        {naturalSize &&
          spaces.map((space) => {
            if (space.x == null || space.y == null || space.width == null || space.height == null) {
              return null;
            }
            const style = {
              left: `${(space.x / naturalSize.width) * 100}%`,
              top: `${(space.y / naturalSize.height) * 100}%`,
              width: `${(space.width / naturalSize.width) * 100}%`,
              height: `${(space.height / naturalSize.height) * 100}%`,
            };
            return (
              <div key={space.id} className="absolute" style={style}>
                {space.type === "large" ? (
                  <ParkingSlotTrack slot={space} style={{ width: "100%", height: "100%" }} />
                ) : (
                  <ParkingSlotCar slot={space} style={{ width: "100%", height: "100%" }} />
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default ParkPhotoMap;
