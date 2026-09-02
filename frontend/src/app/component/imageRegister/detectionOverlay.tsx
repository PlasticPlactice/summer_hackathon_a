import ParkingSlotCar from "../parkInfo/parkMap/parkingSlotCar";
import ParkingSlotTrack from "../parkInfo/parkMap/parkingSlotTrack";
import { ParkingSpace, ParkingSpacePreviewCreate } from "../../../types/parking";

interface DetectionOverlayProps {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  spaces: ParkingSpacePreviewCreate[];
}

// 検出された駐車枠を、実際のマップ表示と同じParkingSlotCar/ParkingSlotTrackを使って
// 画像上に重ねて表示する(座標はimageWidth/imageHeightに対する%に変換して配置する)
function DetectionOverlay({ imageUrl, imageWidth, imageHeight, spaces }: DetectionOverlayProps) {
  return (
    <div className="relative w-full" style={{ aspectRatio: `${imageWidth} / ${imageHeight}` }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- ローカル選択ファイルのblob URLをそのまま表示する */}
      <img src={imageUrl} alt="検出結果プレビュー" className="absolute inset-0 h-full w-full object-contain" />
      {spaces.map((space, index) => {
        // 登録前で実際のidが無いため、表示用の仮スペース情報を組み立てる(status: 0 = 空車)
        const previewSlot: ParkingSpace = {
          id: index,
          type: space.type,
          status: 0,
          parking_id: null,
          sensor_id: null,
        };
        const style = {
          left: `${(space.x / imageWidth) * 100}%`,
          top: `${(space.y / imageHeight) * 100}%`,
          width: `${(space.width / imageWidth) * 100}%`,
          height: `${(space.height / imageHeight) * 100}%`,
        };
        return (
          <div key={index} className="absolute" style={style}>
            {space.type === "large" ? (
              <ParkingSlotTrack slot={previewSlot} style={{ width: "100%", height: "100%" }} />
            ) : (
              <ParkingSlotCar slot={previewSlot} style={{ width: "100%", height: "100%" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default DetectionOverlay;
