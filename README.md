# XNESS

A CFD trading platform built with microservices architecture that enables real-time trading simulation on real-world assets. XNESS replicates core trading mechanics including margin-based liquidation, stop-loss, and take-profit logic, delivering a realistic trading experience through simulated execution without requiring direct market integration.

## Key Features

- **Real-time Price Streaming**: Live asset prices via Binance WebSocket integration
- **Margin Trading Simulation**: Complete margin-based trading with leverage support
- **Risk Management**: Automated liquidation, stop-loss, and take-profit execution
- **Live Trading Charts**: Real-time candlestick charts with multiple timeframe support
- **Scalable WebSocket Architecture**: Distributed real-time data delivery via pub/sub
- **Historical Data Analysis**: Optimized OHLC candle data storage and retrieval
- **Automated Notifications**: Email alerts for all trading operations
- **High-Performance Backend**: Asynchronous order processing with Redis queuing

## Architecture Overview

XNESS follows a distributed microservices architecture designed for scalability and real-time performance. The system leverages Redis pub/sub for inter-service communication, TimescaleDB for time-series data storage, and WebSocket connections for real-time client updates.

The architecture ensures zero-latency trading operations by maintaining live price feeds across all services while providing fault tolerance through service isolation and queue-based processing for non-critical operations like notifications.

## Microservices Breakdown

### Price Poller Service
**Core Responsibility**: Real-time market data acquisition and distribution

- Maintains persistent connection to Binance WebSocket streams
- Publishes live price updates to Redis pub/sub channels
- Stores raw price data in TimescaleDB hypertables
- Ensures consistent price feed availability across all dependent services

### HTTP Backend Service
**Core Responsibility**: Trading operations and user management

- RESTful API endpoints for authentication (signup/signin)
- Real-time order management (open/close positions)
- Margin calculation and automated liquidation logic
- Redis pub/sub integration for live price-based calculations
- Queue-based notification system for trading events

### WebSocket Server
**Core Responsibility**: Real-time client communication

- Distributes live bid/ask prices to connected clients
- Subscribes to Redis pub/sub for scalable price distribution
- Handles client connection management and broadcasting
- Enables horizontal scaling through pub/sub decoupling

### Frontend Application
**Core Responsibility**: User interface and trading experience

- Real-time price display with live updates
- Interactive TradingView-style charts with multiple timeframes
- Order placement interface with volume, leverage, and risk management
- WebSocket integration for seamless real-time updates
- Responsive trading dashboard with portfolio management

### Email Worker Service
**Core Responsibility**: Asynchronous notification processing

- Consumes trading events from Redis streams
- Sends automated email notifications for order operations
- Handles liquidation alerts and portfolio updates
- Decoupled processing ensures trading performance isn't affected

## Tech Stack

### Backend Services
- **Express and Typescript** - API development
- **WebSocket** - Real-time bidirectional communication
- **Redis** - Pub/sub messaging and stream processing

### Frontend
- **React and Typescript** - Modern component-based UI framework

### Database & Storage
- **TimescaleDB** - Time-series data optimization for price storage

### External Integrations
- **Binance WebSocket API** - Real-time market data source

## Database Design

### TimescaleDB Implementation
XNESS utilizes TimescaleDB's time-series optimization for efficient price data storage and retrieval.

**Hypertable Structure**:
```sql
-- Raw price data storage
CREATE TABLE asset_prices (
    time TIMESTAMPTZ NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    price DECIMAL(20,8) NOT NULL,
    volume DECIMAL(20,8)
);

SELECT create_hypertable('asset_prices', 'time');
```

### Materialized Views Strategy
Automated aggregation of OHLC candlestick data across multiple timeframes:

**Continuous Aggregates**:
- **1-minute candles** - Real-time chart updates
- **5-minute candles** - Short-term analysis
- **15-minute candles** - Medium-term patterns  
- **30-minute candles** - Extended timeframe analysis
- **1-hour+ intervals** - Long-term trend analysis

**Benefits**:
- **Pre-computed OHLC data** eliminates real-time calculation overhead
- **Automatic updates** via TimescaleDB continuous aggregation policies
- **Optimized queries** for frontend chart rendering
- **Efficient storage** with time-based partitioning

**Example Materialized View**:
```sql
CREATE MATERIALIZED VIEW candles_1m
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('1 minute', time) AS bucket,
    symbol,
    FIRST(price, time) AS open,
    MAX(price) AS high,
    MIN(price) AS low,
    LAST(price, time) AS close,
    SUM(volume) AS volume
FROM asset_prices
GROUP BY bucket, symbol;
```

This design ensures the frontend receives instant access to historical chart data while maintaining real-time updates through the continuous aggregation system.
