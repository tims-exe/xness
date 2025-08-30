import WebSocket from "ws";
import { Client } from "pg";
import format from "pg-format";
import dotenv from "dotenv";
import { createClient } from "redis";

dotenv.config();

const url =
  "wss://stream.binance.com:9443/stream?streams=btcusdt@aggTrade/ethusdt@aggTrade/solusdt@aggTrade";

const batch_size = 100;
let batch: [string, string, number, number, number, number][] = [];
let batch_count = 1;

const spread = 0.01; // 1%
const halfSpread = spread / 2;

const client = new Client({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: process.env.DB_PASSWORD,
  database: "xness",
});

const redis = createClient({
  url: "redis://localhost:6379",
});

async function startServer() {
  await redis.connect();
  console.log("redis connected");
  console.log("ws server running");
}

startServer().catch(console.error);

await client.connect();
console.log("connected to db");


function formatPrice(str: string): { whole: number; decimal: number } {
  if (!str.includes(".")) {
    return { whole: parseInt(str, 10), decimal: 0 };
  }
  const [intPart, decimalPart] = str.split(".");
  return { whole: parseInt(intPart + decimalPart, 10), decimal: decimalPart.length };
}

function formatBuySell(
  whole: number,
  decimals: number,
  spread: number
): { buy: number; sell: number; decimal: number } {
  const scale = 10 ** decimals;
  const spreadAdj = spread * scale;

  const buy = Math.round((whole * (scale + spreadAdj / 2)) / scale);
  const sell = Math.round((whole * (scale - spreadAdj / 2)) / scale);

  return { buy, sell, decimal: decimals };
}

const ws = new WebSocket(url);

ws.on("open", () => {
  console.log("connected to binance");
});

ws.on("message", async (event) => {
  const data = JSON.parse(event.toString());

  // console.log(data)

  const ts = new Date(data.data.T).toISOString().replace("T", " ").replace("Z", "");

  const { whole: priceWhole, decimal } = formatPrice(data.data.p);

  const { buy, sell } = formatBuySell(priceWhole, decimal, spread);

  const { whole: qtyWhole, decimal: qtyDecimal } = formatPrice(data.data.q);

  batch.push([ts, data.data.s, priceWhole, decimal, qtyWhole, qtyDecimal]);


  // TODO : UPDATE DB COLS TO HAVE NEW INT VALUES AND DECIMAL COL
  if (batch.length >= batch_size) {
    // const query = format(
    //   "INSERT INTO trades (time, asset, price_whole, price_decimal, quantity_whole, quantity_decimal) VALUES %L",
    //   batch
    // );
    // await client.query(query);

    // console.log("Inserted batch:", batch_count);
    // batch_count++;
    batch = [];
  }

  // Publish to Redis
  await redis.publish(
    "trades",
    JSON.stringify({
      timestamp: ts,
      asset: data.data.s,
      price: priceWhole,
      buy,
      sell,
      decimal,
    })
  );
});
