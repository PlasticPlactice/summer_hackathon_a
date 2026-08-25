-- データベーススキーマ定義

CREATE TABLE IF NOT EXISTS parkings (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    capacity INTEGER NOT NULL,
    compact_capacity INTEGER NOT NULL,
    large_capacity INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sensers (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR NOT NULL UNIQUE,
    status SMALLINT NOT NULL,
    last_sens_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS parking_spaces (
    id SERIAL PRIMARY KEY,
    type VARCHAR NOT NULL,
    status SMALLINT NOT NULL,
    parking_id INTEGER REFERENCES parkings(id) ON DELETE CASCADE,
    sensor_id INTEGER REFERENCES sensers(id) ON DELETE SET NULL
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS ix_parkings_id ON parkings(id);
CREATE INDEX IF NOT EXISTS ix_sensers_id ON sensers(id);
CREATE INDEX IF NOT EXISTS ix_parking_spaces_id ON parking_spaces(id);
