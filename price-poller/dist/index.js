import WebSocket from "ws";
import { Client } from 'pg';
const url = `wss://stream.binance.com:9443/stream?streams=btcusdt@aggTrade`;
import format from "pg-format";
const batch_size = 10;
let batch = [];
const client = new Client({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "timescaledb",
    database: "xness",
});
await client.connect();
console.log("connected to db");
const ws = new WebSocket(url);
ws.on("open", () => {
    console.log("connected");
});
ws.onmessage = async (event) => {
    const data = event.data.toString();
    const parseData = JSON.parse(data);
    const ts = new Date(parseData.data.T).toISOString().replace("T", " ").replace("Z", "");
    batch.push([ts, parseData.data.s, parseData.data.p, parseData.data.q]);
    if (batch.length >= batch_size) {
        const query = format("INSERT INTO trades (time, asset, price, quantity) VALUES %L", batch);
        await client.query(query);
        console.log(batch.toString());
        batch = [];
    }
};
