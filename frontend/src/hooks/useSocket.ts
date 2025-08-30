import { useEffect, useState } from "react";
import type { AssetData } from "../types/main-types";


export function useSocket() {
    const [loading, setLoading] = useState(true)
    const [socket, setSocket] = useState<WebSocket>();
    const [assetMap, setAssetMap] = useState<AssetData[]>([]);

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