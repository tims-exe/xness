import WebSocket from "ws";
import {createClient} from 'redis';

const stream = "";
const url = `wss://stream.binance.com:9443/stream?streams=btcusdt@aggTrade`;

const ws = new WebSocket(url);
// const redis = createClient({
//     url: "redis://localhost:6379"
// })

// async function startServer() {
//     await redis.connect()
//     console.log("redis is connected")
// }

// startServer().catch(console.error)

ws.on("open", () => {
  console.log("connected");
});

ws.onmessage = async (event) => {
    const data = event.data.toString()
    const parseData = JSON.parse(data)
    
    const trade_data = {
        timestamp : parseData.data.E,
        asset : parseData.data.s.toString(), 
        price: parseData.data.p.toString()
    }

    // await redis.xAdd("trade_data", "*", trade_data)
};
