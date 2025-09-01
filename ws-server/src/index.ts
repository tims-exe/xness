import { WebSocketServer } from 'ws'
import {createClient} from 'redis'

const wss = new WebSocketServer({port: 8080})

const subscriber = createClient()

await subscriber.connect()


interface AssetData {
    symbol: string 
    price: number
    buy: number
    sell: number 
    decimal : number
    status: "up" | "down"
}

interface IncomingAssetData {
    timestamp: string,
    asset: string,
    price: number,
    buy: number,
    sell: number,
    decimal: number
}

const Prices: AssetData[] = [
  { symbol: "BTCUSDT", price: 0, buy: 0, sell: 0, decimal: 0, status: "up" },
  { symbol: "SOLUSDT", price: 0, buy: 0, sell: 0, decimal: 0, status: "up"},
  { symbol: "ETHUSDT", price: 0, buy: 0, sell: 0, decimal: 0, status: "up" },
];

function updatePrice(newData: AssetData) {
    const idx = Prices.findIndex(p => p.symbol === newData.symbol)

    if (idx !== -1) {
        Prices[idx] = newData
    }
    else {
        console.log('new data : ', newData)
    }
}



wss.on("connection", async (ws) => {
    console.log("connected")

    ws.on("message", (message) => {
        ws.send(`ECHO: ${message}`)
    })
    
    // message from pubsub : {"timestamp":"2025-08-30 09:15:34.969","asset":"BTCUSDT","price":108500,"ask":109856.25,"bid":107143.75}

    await subscriber.subscribe("trades", (message) => {
        const parseData: IncomingAssetData = JSON.parse(message)

        const prev = Prices.find(p => p.symbol === parseData.asset)

        let status: "up" | "down" = "up"
        if (prev) {
            if (prev.buy > parseData.buy) {
                status = "down"
            }
        }

        wss.clients.forEach((client) => {
            if (client.readyState === client.OPEN) {
            const newData: AssetData = {
                symbol: parseData.asset,
                price: parseData.price,
                buy: parseData.buy,
                sell: parseData.sell,
                decimal: parseData.decimal,
                status: status
            }
            updatePrice(newData)

            //console.log(Prices)
            client.send(
                JSON.stringify(Prices)
            )
            }
        });
    });

})