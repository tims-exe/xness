import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv'
import cors from 'cors';
import { Users, OpenTrades, Assets } from "./consts.js";
import { AssetData, IncomingAssetData } from './types/main.js';
import { PriceSubscriber } from './priceSubscriber.js';
import { tradesRouter } from './routes/orders.js';
import { userRouter } from './routes/user.js';

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

app.get("/api/trades/:asset/:time", async (req, res) => {
    const { asset, time } = req.params;
    console.log(`GET: /api/trades/${asset}/${time}`)

    const table = `trades_${time}`

    try {
        const query = `SELECT * FROM ${table} WHERE asset = $1 ORDER BY timestamp DESC LIMIT 200`;
        const { rows } = await pool.query(query, [asset]);
        return res.json(rows.reverse())
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "db query failed" });
    }
})

app.get("/api/get-balance/:id", (req, res) => {
    const id = Number(req.params.id)
    console.log(`GET: /api/get-balance/${id}`)

    const user = Users.find(u => u.id === id);

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    res.json({ balance: user.balances.USD });
});




app.use('/api/v1/user', userRouter)
app.use('/api/v1/trades', tradesRouter)

app.listen(3000, () => {
    console.log("http backend running")
})