import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import cors from 'cors';
import { createClient } from 'redis';
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "xness",
    password: process.env.DB_PASSWORD,
    port: 5432,
});
const subscriber = createClient();
await subscriber.connect();
const Assets = {
    "BTCUSDT": 0,
    "SOLUSDT": 0,
    "ETHUSDT": 0
};
const spread = 0.025;
const halfSpread = spread / 2;
await subscriber.subscribe("trades", (message) => {
    const latestTrade = JSON.parse(message);
    Assets[latestTrade.asset] = latestTrade.price;
    // console.log(Assets)
});
const Users = [
    {
        id: 1,
        username: "abcde",
        balance: 10000.00
    }
];
// /api/trades/BTCUSDT/5
app.get("/api/trades/:asset/:time", async (req, res) => {
    const { asset, time } = req.params;
    console.log(`GET: /api/trades/${asset}/${time}`);
    const table = `trades_${time}`;
    try {
        const query = `SELECT * FROM ${table} WHERE asset = $1 ORDER BY timestamp ASC`;
        const { rows } = await pool.query(query, [asset]);
        return res.json(rows);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "db query failed" });
    }
});
app.get("/api/get-balance/:id", (req, res) => {
    const id = Number(req.params.id);
    console.log(`GET: /api/get-balance/${id}`);
    const user = Users.find(u => u.id === id);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    res.json({ balance: user.balance });
});
// open order (buy/sell)
app.post("/api/open/:id", async (req, res) => {
    console.log("POST: /api/open");
    const id = Number(req.params.id);
    // TODO: zod validation
    const { type, quantity, asset } = req.body;
    const ask = Assets[asset] * (1 + halfSpread);
    const bid = Assets[asset] * (1 - halfSpread);
    const price = quantity * ask;
    console.log(quantity);
    const user = Users.find(u => u.id === id);
    if (!user) {
        return res.json({
            message: "no user found"
        });
    }
    let userBalance = user.balance;
    console.log(userBalance);
    if (userBalance < price) {
        return res.json({
            message: "insufficient balance"
        });
    }
    userBalance -= price;
    console.log({
        balance: userBalance,
        open_price: ask,
        current_price: bid
    });
    if (type === "Buy") {
        return res.json({
            balance: userBalance,
            open_price: ask,
            current_price: bid
        });
    }
    // else for sell
    return res.json({
        message: "error"
    });
});
app.listen(3000, () => {
    console.log("http backend running");
});
