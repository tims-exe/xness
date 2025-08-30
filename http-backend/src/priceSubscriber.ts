import {createClient} from 'redis'
import { AssetData, IncomingAssetData, OpenTradesTypes } from './types.js'
import { OpenTrades, Users } from './consts.js';

export class PriceSubscriber {
    private subscriber = createClient()

    private assets: AssetData[] = []

    constructor(assets: AssetData[]) {
        this.assets = assets
    }

    async connect() {
        await this.subscriber.connect()
        await this.setupSubscription()
    }

    private updatePrice(newData: AssetData) {
        const idx = this.assets.findIndex(p => p.symbol === newData.symbol)
    
        if (idx !== -1) {
            this.assets[idx] = newData
        }
        else {
            console.log('new data : ', newData)
        }
    }

    private async setupSubscription() {
        await this.subscriber.subscribe("trades" , (message) => {
            const latestTrade: IncomingAssetData = JSON.parse(message)
            
            const newData: AssetData = {
                symbol: latestTrade.asset,
                buy: latestTrade.buy,
                sell: latestTrade.sell,
                decimal: latestTrade.decimal,
                status: "up"
            }

            this.updatePrice(newData)
            this.processOpenTrades(latestTrade)
        })
    }

    private processOpenTrades(latestTrade: IncomingAssetData) {
        for (let i = OpenTrades.length - 1 ; i >= 0; i--) {
            const trade = OpenTrades[i]
            const user = Users.find(u => u.id === trade.userId)

            if (!user || trade.asset !== latestTrade.asset) continue

            const currentAsset = this.assets.find(a => a.symbol === latestTrade.asset)!

            if (trade.type === "Buy") {
                trade.pnl = (currentAsset.sell - trade.openPrice) * trade.volume

                if (this.checkSL(trade, currentAsset, "Buy") || this.checkTP(trade, currentAsset, "Buy")) {
                    this.closeTrade(i, trade, user, currentAsset)
                    continue
                }
            }

            else if (trade.type === "Sell") {
                trade.pnl = (trade.openPrice - currentAsset.buy) * trade.volume

                if (this.checkSL(trade, currentAsset, "Sell") || this.checkTP(trade, currentAsset, "Buy")) {
                    this.closeTrade(i, trade, user, currentAsset)
                    continue
                }
            }

            // liquidation
            if (trade.pnl / Math.pow(10, currentAsset.decimal) <= -trade.margin) {
                user.usedMargin -= trade.margin
                OpenTrades.splice(i, 1)
                console.log('liquidated')
            }
        }
    }


    private checkSL(trade: OpenTradesTypes, currentAsset: AssetData, tradeType: "Buy" | "Sell") : boolean {
        if (!trade.stopLoss) return false;

        const currentPrice = tradeType === "Buy"
            ? currentAsset.sell
            : currentAsset.buy
        const originalPrice = currentPrice / Math.pow(10, currentAsset.decimal);

        if (tradeType === "Buy") {
            return originalPrice <= trade.stopLoss
        }
        else {
            return originalPrice >= trade.stopLoss
        }
    }

    private checkTP(trade: OpenTradesTypes, currentAsset: AssetData, tradeType: "Buy" | "Sell") : boolean {
        if (!trade.takeProfit) return false;

        const currentPrice = tradeType === "Buy"
            ? currentAsset.sell
            : currentAsset.buy
        
        const originalPrice = currentPrice / Math.pow(10, currentAsset.decimal)

        if (tradeType === "Buy") {
            return originalPrice >= trade.takeProfit
        }

        else {
            return originalPrice <= trade.takeProfit
        }
    }

    private closeTrade(index: number, trade: OpenTradesTypes, user: any, currentAsset: AssetData) {
        user.balance.USD += trade.pnl / Math.pow(10, currentAsset.decimal)
        user.usedMargin -= trade.margin
        OpenTrades.splice(index, 1)
        console.log("trade closed : ", trade.type, trade.asset)
    }
}