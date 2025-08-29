import { useEffect, useState } from "react";
import type { AssetData } from "../types/main-types";

export function useSocket() {
    const [loading, setLoading] = useState(true)
    const [socket, setSocket] = useState<WebSocket>();
    const [assetMap, setAssetMap] = useState<Record<string, AssetData>>({});

        //     "BTCUSTD": { timestamp: "", asset: "BTCUSTD", price: 0, ask: 0, bid: 0 },
        // "SOLUSTD": { timestamp: "", asset: "SOLUSTD", price: 0, ask: 0, bid: 0 },
        // "ETHUSTD": { timestamp: "", asset: "ETHUSTD", price: 0, ask: 0, bid: 0 },


    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080');

        ws.onopen = () => {
            setLoading(false);
            setSocket(ws)
        }
        ws.onmessage = (event) => {
            const assetData: AssetData = JSON.parse(event.data);

            setAssetMap((prev) => ({
                ...prev,
                [assetData.asset]: assetData,
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