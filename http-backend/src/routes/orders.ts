import express from 'express'
import { Assets, OpenTrades } from '../consts.js'
import { pool } from '../config/db.js';
import { redisClient } from '../config/redis.js';
import { AssetData } from '../types/main.js';

export const tradesRouter = express.Router()

let openTradeId = 0;

// all closed orders
tradesRouter.get('/', (req, res) => {
    res.json({
        message: "closed orders"
    })
})


// get current open orders
tradesRouter.get("/get-orders", async (req, res) => {
  const userId = req.userId

  const result = await pool.query(
        `SELECT id FROM users WHERE id = $1`,
        [userId]
    )

    if (result.rows.length === 0) {
        return res.status(401).json({
            success: false,
            message: "error validating user"
        })
    }

    const user = result.rows[0]

  if (OpenTrades.length > 0) {
    const activeTrades = OpenTrades.map((trade) => {
        const assetData = Assets.find(a => a.symbol === trade.asset)!
        
        // pnl calculation using big integers
        const currentPnl = trade.type === "Buy" 
            ? (assetData.sell - trade.openPrice) * trade.volume
            : (trade.openPrice - assetData.buy) * trade.volume
        
        return {
            orderId: trade.orderId,
            asset: trade.asset,
            type: trade.type,
            volume: trade.volume,
            open_price: trade.openPrice / Math.pow(10, assetData.decimal), 
            current_price: trade.type === "Buy" 
                ? assetData.sell / Math.pow(10, assetData.decimal) 
                : assetData.buy / Math.pow(10, assetData.decimal), 
            pnl: currentPnl / Math.pow(10, assetData.decimal),
            stopLoss: trade.stopLoss,
            takeProfit: trade.takeProfit,
            margin: trade.margin
        }
    })
    return res.json(activeTrades)
  }

  return res.json({
    message: "error"
  })
});



// open order (buy/sell)
tradesRouter.post('/open', async (req, res) => {
    console.log("POST: /api/open");

    const userId = req.userId!
    const { type, volume, asset, leverage, stopLoss, takeProfit } = req.body;

    const currentAsset = Assets.find(a => a.symbol === asset)!
    const currentBuy = currentAsset.buy / Math.pow(10, currentAsset.decimal)
    const currentSell = currentAsset.sell / Math.pow(10, currentAsset.decimal)

    const position_value = volume * currentBuy
    const margin = position_value / leverage

    // fetch user
    const result = await pool.query(
        `SELECT id, email, balance, used_margin FROM users WHERE id = $1`,
        [userId]
    )

    if (result.rows.length === 0) {
        return res.status(401).json({
            success: false,
            message: "error validating user"
        })
    }

    const user = result.rows[0]

    const freeMargin = user.balance - user.used_margin
    if (freeMargin < margin) {
        return res.json({ message: "insufficient balance" })
    }

    // update DB with new used_margin
    await pool.query(
        `UPDATE users SET used_margin = used_margin + $1 WHERE id = $2`,
        [margin, userId]
    )

    // Store prices as big integers
    let openPrice: number = currentAsset.buy
    let currentPrice: number = currentAsset.sell

    if (type === "Sell") {
        openPrice = currentAsset.sell
        currentPrice = currentAsset.buy
    }

    openTradeId++;

    OpenTrades.push({
        userId,
        orderId: openTradeId,
        volume,
        margin,
        openPrice,
        asset,
        type,
        pnl: (currentAsset.sell - currentAsset.buy) * volume,
        takeProfit,
        stopLoss
    })

    const emailBody = createEmail(asset, type, volume, openPrice, currentAsset, leverage, margin)

    console.log(emailBody)

    // push to redis stream
    await redisClient.xAdd('trades_stream', '*', {
        recipient: user.email,
        subject: 'Trade Confirmation',
        body: emailBody
    })

    return res.json({
        orderId: openTradeId,
        balance: user.balance,
        open_price: openPrice / Math.pow(10, currentAsset.decimal), 
        current_price: currentPrice / Math.pow(10, currentAsset.decimal),
        margin,
        leverage,
        type
    })
})



// close order (buy/sell)
tradesRouter.post("/close", async (req, res) => {
    console.log("POST: /api/close");
    const { orderId } = req.body
    const userId = req.userId

    const currentTrade = OpenTrades.find(t => t.orderId === orderId)
    const currentAsset = Assets.find(a => a.symbol === currentTrade?.asset)!
    const index = OpenTrades.findIndex(t => t.orderId === orderId);

    const result = await pool.query(
        `SELECT id, balance, used_margin FROM users WHERE id = $1`,
        [userId]
    )

    if (result.rows.length === 0) {
        return res.status(401).json({ success: false, message: "error validating user" })
    }

    const user = result.rows[0]

    if (currentTrade && index !== -1) {
        const currentPnl =
            currentTrade.type === "Buy" 
                ? (currentAsset.sell - currentTrade.openPrice) * currentTrade.volume 
                : (currentTrade.openPrice - currentAsset.buy) * currentTrade.volume 

        // update user balance + free margin in DB
        await pool.query(
            `UPDATE users SET 
                balance = balance + $1,
                used_margin = used_margin - $2
             WHERE id = $3`,
            [currentPnl / Math.pow(10, currentAsset.decimal), currentTrade.margin, userId]
        )

        OpenTrades.splice(index, 1)

        return res.json({
            success: true,
            message: "trade closed"
        })
    }

    return res.json({ success: false, message: "no trade" })
})


function createEmail(asset: string, type: "Buy" | "Sell", volume: number, openPrice: number, currentAsset: AssetData , leverage: number, margin: number) {
    const emailBody = `
        <p>Hi,</p>
        <p>Your trade has been opened successfully:</p>
        <ul>
        <li><strong>Asset:</strong> ${asset}</li>
        <li><strong>Type:</strong> ${type}</li>
        <li><strong>Volume:</strong> ${volume}</li>
        <li><strong>Open Price:</strong> ${openPrice / Math.pow(10, currentAsset.decimal)}</li>
        <li><strong>Leverage:</strong> ${leverage}x</li>
        <li><strong>Margin Used:</strong> ${margin}</li>
        </ul>
        <br/>
        <p>— xness</p>
    `

    return emailBody
}