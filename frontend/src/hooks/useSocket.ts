import { useEffect, useState } from "react";

export function useSocket() {
    const [loading, setLoading] = useState(true)
    const [socket, setSocket] = useState<WebSocket>();


    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080');

        ws.onopen = () => {
            setLoading(false);
            setSocket(ws)
        }
    }, [])

    return {
        socket,
        loading
    }
}