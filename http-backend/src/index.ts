import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv'
import cors from 'cors';
import { Users, OpenTrades, Assets } from "./consts.js";
import { AssetData, IncomingAssetData } from './types/main.js';
import { PriceSubscriber } from './priceSubscriber.js';
import { tradesRouter } from './routes/orders.js';
import { userRouter } from './routes/user.js';
import { authMiddleware } from './routes/authMiddleware.js';

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "xness",
    password: process.env.DB_PASSWORD,
    port: 5432,
})


const priceSubscriber = new PriceSubscriber(Assets);

try {
    await priceSubscriber.connect()
    console.log('connected to pubsub')
} catch (error) {
    console.log('error starting server', error)
}

const liquidationMargin = 1

let openTradeId = 0;

app.get("/api/v1/candles", authMiddleware, async (req, res) => {
  const { asset, ts } = req.query;

  if (!asset || !ts) {
    return res.status(400).json({ error: "missing query params" });
  }

  const table = `trades_${ts}`;

  try {
    const query = `
      SELECT * FROM ${table}
      WHERE asset = $1 
      ORDER BY timestamp ASC
      LIMIT 200
    `;

    const { rows } = await pool.query(query, [asset]);

    const candles = rows.map(r => ({
        timestamp: Math.floor(new Date(r.timestamp).getTime() / 1000),
        open_price: Number(r.open_price),
        close_price: Number(r.close_price),
        high_price: Number(r.high_price),
        low_price: Number(r.low_price),
    }));

    return res.json(candles);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "db query failed" });
  }
});



app.use('/api/v1/user', userRouter)
app.use('/api/v1/orders', authMiddleware, tradesRouter)

app.listen(3000, () => {
    console.log("http backend running")
})