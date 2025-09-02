-- initial dump table

-- 1. Create the main trades table
CREATE TABLE trades (
    time     TIMESTAMPTZ NOT NULL,
    asset    TEXT NOT NULL,
    price    DOUBLE PRECISION NOT NULL,
    quantity NUMERIC,
    decimals NUMERIC
);

-- make it a hypertable
SELECT create_hypertable('trades', 'time', if_not_exists => TRUE);


-- 1-minute aggregation
CREATE MATERIALIZED VIEW IF NOT EXISTS trades_1m
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 minute', time) AS timestamp,
    asset,
    FIRST(price, time) AS open_price,
    LAST(price, time) AS close_price,
    MAX(price) AS high_price,
    MIN(price) AS low_price,
    SUM(quantity) AS volume,
    MAX(decimals) AS max_decimals
FROM trades
GROUP BY timestamp, asset;

-- 5-minute aggregation
CREATE MATERIALIZED VIEW IF NOT EXISTS trades_5m
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('5 minute', time) AS timestamp,
    asset,
    FIRST(price, time) AS open_price,
    LAST(price, time) AS close_price,
    MAX(price) AS high_price,
    MIN(price) AS low_price,
    SUM(quantity) AS volume,
    MAX(decimals) AS max_decimals
FROM trades
GROUP BY timestamp, asset;

-- 15-minute aggregation
CREATE MATERIALIZED VIEW IF NOT EXISTS trades_15m
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('15 minute', time) AS timestamp,
    asset,
    FIRST(price, time) AS open_price,
    LAST(price, time) AS close_price,
    MAX(price) AS high_price,
    MIN(price) AS low_price,
    SUM(quantity) AS volume,
    MAX(decimals) AS max_decimals
FROM trades
GROUP BY timestamp, asset;

-- 30-minute aggregation
CREATE MATERIALIZED VIEW IF NOT EXISTS trades_30m
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('30 minute', time) AS timestamp,
    asset,
    FIRST(price, time) AS open_price,
    LAST(price, time) AS close_price,
    MAX(price) AS high_price,
    MIN(price) AS low_price,
    SUM(quantity) AS volume,
    MAX(decimals) AS max_decimals
FROM trades
GROUP BY timestamp, asset;


-- 1m policy
SELECT add_continuous_aggregate_policy(
    'trades_1m',
    start_offset => INTERVAL '1 day',
    end_offset   => INTERVAL '1 minute',
    schedule_interval => INTERVAL '1 minute'
);

-- 5m policy
SELECT add_continuous_aggregate_policy(
    'trades_5m',
    start_offset => INTERVAL '1 day',
    end_offset   => INTERVAL '5 minute',
    schedule_interval => INTERVAL '5 minute'
);

-- 15m policy
SELECT add_continuous_aggregate_policy(
    'trades_15m',
    start_offset => INTERVAL '1 day',
    end_offset   => INTERVAL '15 minute',
    schedule_interval => INTERVAL '15 minute'
);

-- 30m policy
SELECT add_continuous_aggregate_policy(
    'trades_30m',
    start_offset => INTERVAL '1 day',
    end_offset   => INTERVAL '30 minute',
    schedule_interval => INTERVAL '30 minute'
);
