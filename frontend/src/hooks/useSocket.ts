import { useEffect, useState } from "react";
import type { AssetData } from "../types/main-types";


export function useSocket() {
    const [loading, setLoading] = useState(true)
    const [socket, setSocket] = useState<WebSocket>();
    // const [assetMap, setAssetMap] = useState<Record<string, AssetData>>({
    //     "BTCUSDT": { price: 0, ask: 0, bid: 0 },
    //     "SOLUSDT": { price: 0, ask: 0, bid: 0 },
    //     "ETHUSDT": { price: 0, ask: 0, bid: 0 },
    // });

    const [assetMap, setAssetMap] = useState<AssetData[]>([]);

    //  {
    // 	price_updates: [{
    // 		symbol: "BTC",
    // 		buyPrice: 1002000000, // decimal is 4
    // 		sellPrice: 1000000000,
    // 		decimals: 4,
    // 	}, {
    // 		symbol: "SOL",
    // 		buyPrice: 2000000, // decimal is 4
    // 		sellPrice: 1900000,
    // 		decimals: 4,
    // 	}]
    // }


    // fetch initial assetmap data
    // from http backend
    // GET: /api/v1/assets 

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080');

        ws.onopen = () => {
            console.log("Websocket Open");
            
            setLoading(false);
            setSocket(ws)
        }
        ws.onmessage = (event) => {
            const assetData: AssetData[] = JSON.parse(event.data);

            // console.log('data: ', assetData)

            setAssetMap(assetData)
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