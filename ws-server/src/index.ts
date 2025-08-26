import { WebSocketServer } from 'ws'
import {createClient} from 'redis'

const wss = new WebSocketServer({port: 8080})

const subscriber = createClient()

await subscriber.connect()


wss.on("connection", async (ws) => {
    console.log("connected")

    ws.on("message", (message) => {
        ws.send(`ECHO: ${message}`)
    })
    
    await subscriber.subscribe("trades", (message) => {
        wss.clients.forEach((client) => {
            if (client.readyState === client.OPEN) {
            client.send(message);
            }
        });
    });

})