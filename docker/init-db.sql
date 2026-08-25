-- 駐車場マスタテーブル初期データ
INSERT INTO parkings (name, capacity) VALUES
  ('南駐車場', 50),
  ('北駐車場', 30);

-- センサーマスタテーブル初期データ
INSERT INTO sensers (device_id, status, last_sens_at) VALUES
  ('SENSOR_001', 0, NOW()),
  ('SENSOR_002', 1, NOW()),
  ('SENSOR_003', 0, NOW()),
  ('SENSOR_004', 1, NOW());

-- 駐車スペース初期データ
-- 南駐車場(ID=1)のスペース
INSERT INTO parking_spaces (type, status, parking_id, sensor_id) VALUES
  ('standard', 0, 1, 1),
  ('standard', 1, 1, 2),
  ('standard', 0, 1, 3),
  ('compact', 1, 1, 4);

-- 北駐車場(ID=2)のスペース
INSERT INTO parking_spaces (type, status, parking_id, sensor_id) VALUES
  ('standard', 0, 2, 1),
  ('compact', 0, 2, 2);
