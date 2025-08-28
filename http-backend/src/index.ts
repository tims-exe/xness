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

let openTradeId = 0;

await subscriber.subscribe("trades", (message) => {
    const latestTrade = JSON.parse(message)

    Assets[latestTrade.asset] = {
        price: latestTrade.price,
        ask: latestTrade.ask,
        bid: latestTrade.bid,
    }

    for (let i = OpenTrades.length - 1; i >= 0; i--) {
        const trade = OpenTrades[i]
        const user = Users.find(u => u.id === trade.userId)

        if (user) {
            if (trade.asset === latestTrade.asset) {
                if (trade.type === "Buy") {
                    trade.pnl = (latestTrade.bid - trade.openPrice) * trade.volume
                } else if (trade.type === "Sell") {
                    trade.pnl = (trade.openPrice - latestTrade.ask) * trade.volume
                }

                if (trade.pnl <= -trade.margin) {
                    OpenTrades.splice(i, 1)
                    user.usedMargin -= trade.margin
                }
            }
        }
    }
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


app.get("/api/get-orders/:id", (req, res) => {
  const id = Number(req.params.id)

  console.log(`GET: /api/get-orders/${id}`)

  const user = Users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (OpenTrades.length > 0) {
    const activeTrades = OpenTrades.map((trade) => {
        const assetData = Assets[trade.asset]

        return {
            orderId: trade.orderId,
            asset: trade.asset,
            type: trade.type,
            volume: trade.volume,
            open_price: trade.openPrice,
            current_price: trade.type === "Buy" ? assetData.bid : assetData.ask,
            pnl: trade.type === "Buy" 
            ? (assetData.bid - trade.openPrice) * trade.volume
            : (trade.openPrice - assetData.ask) * trade.volume
        }
    })
    //console.log(activeTrades)
    return res.json(activeTrades)
  }

  return res.json({
    message: ""
  })

});


// open order (buy/sell)
app.post("/api/open/", async (req, res) => {
    console.log("POST: /api/open");

    // TODO: zod validation
    const { userId, type, volume, asset, leverage } = req.body;

    const position_value = volume * Assets[asset].ask
    const margin = position_value/leverage

    const user = Users.find(u => u.id === userId)

    if (!user) {
        return res.json({
            message: "no user found"
        })
    }

    const freeMargin = user.balances.USD - user.usedMargin

    //console.log(user.balances.USD)
    if (freeMargin < margin) {
        return res.json({
            message: "insufficient balance"
        })
    }

    user.usedMargin += margin

    if (type === "Buy") {
        // user.balances.USD -= margin 
        openTradeId++;

        OpenTrades.push({
            userId: userId,
            orderId : openTradeId,
            volume : volume,
            margin : margin,
            openPrice: Assets[asset].ask,
            asset: asset,
            type: type, 
            pnl: (Assets[asset].bid - Assets[asset].ask) * volume
        })

        return res.json({
            orderId: openTradeId,
            balance : user.balances.USD,
            open_price: Assets[asset].ask,
            current_price: Assets[asset].bid,
        })
    }

    else if (type === "Sell") {
        openTradeId++;

        OpenTrades.push({
            userId: userId,
            orderId : openTradeId,
            volume : volume,
            margin : margin,
            openPrice: Assets[asset].bid,
            asset: asset,
            type: type, 
            pnl: (Assets[asset].bid - Assets[asset].ask) * volume
        })

        return res.json({
            orderId: openTradeId,
            balance : user.balances.USD,
            open_price: Assets[asset].bid,
            current_price: Assets[asset].ask,
        })
    }

    return res.json({
        message: "error"
    })
});


// close order (buy/sell)
app.post("/api/close/", async (req, res) => {
    console.log("POST: /api/close");
    console.log(req.body)
    const { userId, orderId } = req.body

    const currentTrade = OpenTrades.find(t => t.orderId === orderId)
    const index = OpenTrades.findIndex(t => t.orderId === orderId);
    const user = Users.find(u => u.id === userId)

    console.log(user, currentTrade)

    if(user) {
        if (currentTrade && index !== -1) {
            const currentPnl = 
                currentTrade.type == "Buy" ?  
                (Assets[currentTrade?.asset].bid - currentTrade.openPrice) * currentTrade.volume 
                :
                (currentTrade.openPrice - Assets[currentTrade?.asset].ask) * currentTrade.volume 


            user.balances.USD += currentPnl

            user.usedMargin -= currentTrade.margin

            OpenTrades.splice(index, 1)

            return res.json({
                status: "success",
                message: user?.balances.USD,
            })
        }
        return res.json({
            status: "failed",
            message: "no trade"
        })
    }
})


app.listen(3000 , () => {
    console.log("http backend running")
})