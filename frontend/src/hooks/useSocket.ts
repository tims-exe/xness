import { useEffect, useState } from "react";
import type { AssetData } from "../types/main-types";

export function useSocket() {
    const [loading, setLoading] = useState(true)
    const [socket, setSocket] = useState<WebSocket>();
    const [assetMap, setAssetMap] = useState<Record<string, AssetData>>({
        "BTCUSDT": { price: 0, ask: 0, bid: 0 },
        "SOLUSDT": { price: 0, ask: 0, bid: 0 },
        "ETHUSDT": { price: 0, ask: 0, bid: 0 },
    });


    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080');

        ws.onopen = () => {
            console.log("Websocket Open");
            
            setLoading(false);
            setSocket(ws)
        }
        ws.onmessage = (event) => {
            const assetData = JSON.parse(event.data);

            setAssetMap((prev) => ({
                ...prev,
                [assetData.asset]: {
                    price: assetData.price,
                    ask: assetData.ask,
                    bid: assetData.bid
                },
            }));
        };
        ws.onclose = () => {
            console.log("close");
        };

        return () => {
            ws.close();
        };
    }, [])

    return {
        socket,
        loading,
        assetMap
    }
}