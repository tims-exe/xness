import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";

interface AssetData {
    timestamp: string
    asset: string 
    price: number
}


const Prices = () => {
    const { socket, loading } = useSocket()
    const [asset, setAsset] = useState<AssetData>()

    useEffect(() => {
        
        if (socket && !loading) {
            socket.onmessage = (event) => {
                console.log(event.data)
                setAsset(JSON.parse(event.data))
            }
            socket.onclose = () => {
                console.log("close")
            }
            return () => {
                socket.close()
            }
        }
    }, [socket, loading])

    return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
        <p className="text-xl font-semibold">{asset?.asset}</p>
        <p className="text-xl font-bold text-green-600">{asset?.price}</p>

    </div>
    )
}

export default Prices