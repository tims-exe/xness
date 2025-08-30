import express from 'express';
import { Pool } from 'pg'; 
import dotenv from 'dotenv'
import cors from 'cors';
import { Users, OpenTrades } from "./consts.js";
import { AssetData, IncomingAssetData } from './types.js';
import { PriceSubscriber } from './priceSubscriber.js';

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


const Assets: AssetData[] = [
    { symbol: "BTCUSDT", buy: 0, sell: 0, decimal: 0, status: "up" },
    { symbol: "SOLUSDT", buy: 0, sell: 0, decimal: 0, status: "up"},
    { symbol: "ETHUSDT", buy: 0, sell: 0, decimal: 0, status: "up" },
];

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
    const {asset, time} = req.params;
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

app.get("/api/get-orders/:id", (req, res) => {
  const id = Number(req.params.id)

  const user = Users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (OpenTrades.length > 0) {
    const activeTrades = OpenTrades.map((trade) => {
        const assetData = Assets.find(a => a.symbol === trade.asset)!
        
        // PnL calculation using big integers
        const currentPnl = trade.type === "Buy" 
            ? (assetData.sell - trade.openPrice) * trade.volume
            : (trade.openPrice - assetData.buy) * trade.volume
        
        return {
            orderId: trade.orderId,
            asset: trade.asset,
            type: trade.type,
            volume: trade.volume,
            open_price: trade.openPrice / Math.pow(10, assetData.decimal), // Convert to decimal for frontend
            current_price: trade.type === "Buy" 
                ? assetData.sell / Math.pow(10, assetData.decimal) 
                : assetData.buy / Math.pow(10, assetData.decimal), // Convert to decimal for frontend
            pnl: currentPnl / Math.pow(10, assetData.decimal), // Convert to decimal for frontend
            stopLoss: trade.stopLoss,
            takeProfit: trade.takeProfit
        }
    })
    return res.json(activeTrades)
  }

  return res.json({
    message: ""
  })
});

// open order (buy/sell)
app.post("/api/open/", async (req, res) => {
    console.log("POST: /api/open");

    const { userId, type, volume, asset, leverage, stopLoss, takeProfit } = req.body;

    const currentAsset = Assets.find(a => a.symbol === asset)!
    const currentBuy = currentAsset.buy / Math.pow(10, currentAsset.decimal)
    const currentSell = currentAsset.sell / Math.pow(10, currentAsset.decimal)

    const position_value = volume * currentBuy
    const margin = position_value/leverage

    const user = Users.find(u => u.id === userId)

    if (!user) {
        return res.json({
            message: "no user found"
        })
    }

    const freeMargin = user.balances.USD - user.usedMargin
    console.log(freeMargin, margin, freeMargin < margin)
    
    if (freeMargin < margin) {
        return res.json({
            message: "insufficient balance"
        })
    }

    user.usedMargin += margin

    // Store prices as big integers
    let openPrice: number = currentAsset.buy
    let currentPrice: number = currentAsset.sell

    if (type === "Sell") {
        openPrice = currentAsset.sell
        currentPrice = currentAsset.buy
    }

    openTradeId++;

    OpenTrades.push({
        userId: userId,
        orderId : openTradeId,
        volume : volume,
        margin : margin,
        openPrice: openPrice, // Store as big integer
        asset: asset,
        type: type, 
        pnl: (currentAsset.sell - currentAsset.buy) * volume, // Calculate with big integers
        takeProfit: takeProfit,
        stopLoss: stopLoss
    })  

    return res.json({
        orderId: openTradeId,
        balance : user.balances.USD,
        open_price: openPrice / Math.pow(10, currentAsset.decimal), // Convert to decimal for frontend
        current_price: currentPrice / Math.pow(10, currentAsset.decimal), // Convert to decimal for frontend
    })
});

// close order (buy/sell)
app.post("/api/close/", async (req, res) => {
    console.log("POST: /api/close");
    console.log(req.body)
    const { userId, orderId } = req.body

    const currentTrade = OpenTrades.find(t => t.orderId === orderId)
    const currentAsset = Assets.find(a => a.symbol === currentTrade?.asset)!
    const index = OpenTrades.findIndex(t => t.orderId === orderId);
    const user = Users.find(u => u.id === userId)

    console.log(user, currentTrade)

    if(user) {
        if (currentTrade && index !== -1) {
            // PnL calculation using big integers
            const currentPnl = 
                currentTrade.type == "Buy" ?  
                (currentAsset.sell - currentTrade.openPrice) * currentTrade.volume 
                :
                (currentTrade.openPrice - currentAsset.buy) * currentTrade.volume 

            // Convert to decimal when updating user balance
            user.balances.USD += currentPnl / Math.pow(10, currentAsset.decimal)
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