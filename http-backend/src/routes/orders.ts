import express from 'express'
import { Assets, OpenTrades, Users } from '../consts'


export const tradesRouter = express.Router()

let openTradeId = 0;

// all closed orders
tradesRouter.get('/', (req, res) => {
    res.json({
        message: "closed orders"
    })
})


// get current open orders
tradesRouter.get("/api/get-orders/:id", (req, res) => {
  const id = Number(req.params.id)

  const user = Users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

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
    message: "error"
  })
});



// open order (buy/sell)
tradesRouter.post('/open', (req, res) => {
    console.log("POST: /api/open");

    const { userId, type, volume, asset, leverage, stopLoss, takeProfit } = req.body;

    const currentAsset = Assets.find(a => a.symbol === asset)!
    const currentBuy = currentAsset.buy / Math.pow(10, currentAsset.decimal)
    const currentSell = currentAsset.sell / Math.pow(10, currentAsset.decimal)

    const position_value = volume * currentBuy
    const margin = position_value / leverage

    const user = Users.find(u => u.id === userId)!

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
        orderId: openTradeId,
        volume: volume,
        margin: margin,
        openPrice: openPrice, // Store as big integer
        asset: asset,
        type: type,
        pnl: (currentAsset.sell - currentAsset.buy) * volume, // Calculate with big integers
        takeProfit: takeProfit,
        stopLoss: stopLoss
    })

    return res.json({
        orderId: openTradeId,
        balance: user.balances.USD,
        open_price: openPrice / Math.pow(10, currentAsset.decimal), // Convert to decimal for frontend
        current_price: currentPrice / Math.pow(10, currentAsset.decimal), // Convert to decimal for frontend
    })

})




// close order (buy/sell)
tradesRouter.post("/api/close/", async (req, res) => {
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
            // pnl calculation using big integers
            const currentPnl = 
                currentTrade.type == "Buy" ?  
                (currentAsset.sell - currentTrade.openPrice) * currentTrade.volume 
                :
                (currentTrade.openPrice - currentAsset.buy) * currentTrade.volume 

            // convert to decimal when updating user balance
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
