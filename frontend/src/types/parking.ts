// バックエンドのschemas/parking.py, schemas/spaces.pyと1:1で対応する型
// 将来API接続する際、fetchしたJSONをそのまま代入できるようフィールド名をバックエンドと完全一致させる

export interface ParkingSpace {
  id: number;
  parking_number: number;
  type: string; // "compact" | "large" 等、駐車スペースの種別
  status: number; // 0: 空車, 1: 満車
  parking_id: number | null;
  sensor_id: number | null;
  // YOLOによる検出結果の座標(元画像のピクセル単位)。前沢PA等の模式図表示のみのデータには無い
  x: number | null;
  y: number | null;
  width: number | null;
  height: number | null;
}

// バックエンドのschemas/sensor.py SensorResponseと1:1で対応する型
export interface Sensor {
  id: number;
  device_id: string;
  status: number; // 0: 空車, 1: 満車
  last_sens_at: string | null;
}

export interface Parking {
  id: number;
  name: string;
  capacity: number;
  compact_capacity: number;
  large_capacity: number;
  image_path: string | null;
}

export interface ParkingStatus extends Parking {
  available_spaces: number;
  occupied_spaces: number;
  spaces: ParkingSpace[];
}

// バックエンドのschemas/spaces.py ParkingSpacePreviewCreateと1:1で対応する型
// POST /api/v1/parkings/preview のレスポンスに含まれ、そのままPOST /api/v1/parkingsへ渡す
export interface ParkingSpacePreviewCreate {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  type: "compact" | "large";
}

// バックエンドのschemas/parking.py ParkingPreviewResponseと1:1で対応する型
export interface ParkingPreviewResponse {
  image_width: number;
  image_height: number;
  image_path: string;
  spaces: ParkingSpacePreviewCreate[];
}
