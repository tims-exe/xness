import express from 'express';
import { Pool } from 'pg'; 
import dotenv from 'dotenv'
import cors from 'cors';
import {createClient} from 'redis'
import { AssetData } from './types';
import { Users, Assets, OpenTrades } from "./consts.js";

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

const subscriber = createClient()
await subscriber.connect()


const spread = 0.025
const halfSpread = spread / 2

let openTradeId = 1;

await subscriber.subscribe("trades", (message) => {
    const latestTrade = JSON.parse(message)

    Assets[latestTrade.asset] = {
        price: latestTrade.price,
        ask: latestTrade.ask,
        bid: latestTrade.bid
    }

    // console.log(Assets)
});


// /api/trades/BTCUSDT/5

app.get("/api/trades/:asset/:time", async (req, res) => {
    
    const {asset, time} = req.params;

    console.log(`GET: /api/trades/${asset}/${time}`)
    
    const table = `trades_${time}`

    try {
        const query = `SELECT * FROM ${table} WHERE asset = $1 ORDER BY timestamp ASC`;
        const { rows } = await pool.query(query, [asset]);
        return res.json(rows)
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


// open order (buy/sell)
app.post("/api/open/:id", async (req, res) => {
    console.log("POST: /api/open");

    const id = Number(req.params.id);

    // TODO: zod validation
    const { type, volume, asset, leverage } = req.body;

    const position_value = volume * Assets[asset].ask

    const user = Users.find(u => u.id === id)

    if (!user) {
        return res.json({
            message: "no user found"
        })
    }

    console.log(user.balances.USD)
    if (user.balances.USD < position_value) {
        return res.json({
            message: "insufficient balance"
        })
    }

    if (type === "Buy") {
        const margin = position_value/leverage

        user.balances.USD -= margin 

        OpenTrades.push({
            orderId : openTradeId,
            volume : volume,
            margin : margin,
            openPrice: Assets[asset].ask
        })

        console.log(OpenTrades)

        openTradeId++;

        return res.json({
            orderId: openTradeId,
            balance : user.balances.USD,
            open_price: Assets[asset].ask,
            current_price: Assets[asset].bid
        })
    }
    // else for sell
    return res.json({
        message: "error"
    })
});


app.listen(3000 , () => {
    console.log("http backend running")
})