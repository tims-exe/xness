import {createClient} from 'redis'
import { AssetData, IncomingAssetData, OpenTradesTypes } from './types'
import { OpenTrades, Users } from './consts';

export class PriceSubscriber {
    private subscriber = createClient()

    private assets: AssetData[] = [
        { symbol: "BTCUSDT", buy: 0, sell: 0, decimal: 0, status: "up" },
        { symbol: "SOLUSDT", buy: 0, sell: 0, decimal: 0, status: "up"},
        { symbol: "ETHUSDT", buy: 0, sell: 0, decimal: 0, status: "up" },
    ];

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

                if (this.checkSL(trade, currentAsset, "Buy") || this.checkTP()) {
                    this.closeTrade(i, trade, user, currentAsset)
                    continue
                }
            }

            else if (trade.type === "Sell") {
                trade.pnl = (trade.openPrice - currentAsset.buy) * trade.volume

                if (this.checkSL(trade, currentAsset, "Sell") || this.checkTP()) {
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
    }

}