-- 駐車場マスタテーブル初期データ
INSERT INTO parkings (id, name, capacity, compact_capacity, large_capacity) VALUES
  (1, '前沢PA（上り）', 101, 79, 22),
  (2, '前沢PA（下り）', 105, 79, 26);


-- センサーマスタテーブル初期データ (上り用: 101個, ID: 1~101)
INSERT INTO sensers (id, device_id, status, last_sens_at)
SELECT 
  i,
  'SENSOR_UP_' || LPAD(i::text, 3, '0'),
  (i % 2),
  NOW()
FROM generate_series(1, 101) AS i;

-- センサーマスタテーブル初期データ (下り用: 105個, ID: 102~206)
INSERT INTO sensers (id, device_id, status, last_sens_at)
SELECT 
  i,
  'SENSOR_DOWN_' || LPAD((i - 101)::text, 3, '0'),
  ((i + 1) % 2),
  NOW()
FROM generate_series(102, 206) AS i;

-- 駐車スペース初期データ (上り PA: 101区画)
INSERT INTO parking_spaces (type, status, parking_id, sensor_id)
SELECT
  CASE WHEN i % 5 = 0 THEN 'large' WHEN i % 2 = 0 THEN 'compact' ELSE 'standard' END,
  (i % 2),
  1,
  i
FROM generate_series(1, 101) AS i;

-- 駐車スペース初期データ (下り PA: 105区画)
INSERT INTO parking_spaces (type, status, parking_id, sensor_id)
SELECT
  CASE WHEN (i - 101) % 5 = 0 THEN 'large' WHEN (i - 101) % 2 = 0 THEN 'compact' ELSE 'standard' END,
  ((i + 1) % 2),
  2,
  i
FROM generate_series(102, 206) AS i;

-- AUTO INCREMENT (シーケンス) の値を調整
SELECT setval('parkings_id_seq', (SELECT MAX(id) FROM parkings));
SELECT setval('sensers_id_seq', (SELECT MAX(id) FROM sensers));
SELECT setval('parking_spaces_id_seq', (SELECT MAX(id) FROM parking_spaces));
