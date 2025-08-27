import WebSocket from "ws";
import { Client } from 'pg';
import format from "pg-format";
import dotenv from 'dotenv';
import { createClient } from "redis";
dotenv.config();
const url = `wss://stream.binance.com:9443/stream?streams=btcusdt@aggTrade/ethusdt@aggTrade/solusdt@aggTrade`;
const batch_size = 100;
let batch = [];
const client = new Client({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: process.env.DB_PASSWORD,
    database: "xness",
});
const redis = createClient({
    url: 'redis://localhost:6379'
});
async function startServer() {
    await redis.connect();
    console.log("redis connected");
    console.log("ws server running");
}
startServer().catch(console.error);
await client.connect();
console.log("connected to db");
const ws = new WebSocket(url);
ws.on("open", () => {
    console.log("connected");
});
ws.on("message", async (event) => {
    const data = event.toString();
    const parseData = JSON.parse(data);
    const ts = new Date(parseData.data.T).toISOString().replace("T", " ").replace("Z", "");
    batch.push([ts, parseData.data.s, parseData.data.p, parseData.data.q]);
    // console.log(parseData)
    if (batch.length >= batch_size) {
        const query = format("INSERT INTO trades (time, asset, price, quantity) VALUES %L", batch);
        await client.query(query);
        console.log(batch.toString());
        batch = [];
    }
    await redis.publish("trades", JSON.stringify({
        timestamp: ts,
        asset: parseData.data.s,
        price: parseFloat(parseData.data.p),
    }));
});
