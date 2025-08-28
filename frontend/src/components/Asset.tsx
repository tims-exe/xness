/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react"
import type { AssetData } from "../types/main-types"

const AssetCard = ({ asset }: {
  asset: AssetData,
}) => {
    const [ask, setAsk] = useState<number>()
    const [bid, setBid] = useState<number>()
    const [askColor, setAskColor] = useState<string>("bg-green-300")
    const [bidColor, setBidColor] = useState<string>("bg-green-300")

    useEffect(() => {
      const prevAsk = ask
      const prevBid = bid

      const spread = 0.025
      const halfSpread = spread / 2

      const currentAsk = asset.price * (1 + halfSpread)
      const currentBid = asset.price * (1 - halfSpread)

      if (prevAsk !== undefined) {
        setAskColor(currentAsk > prevAsk ? "bg-green-300" : "bg-red-300")
      }

      if (prevBid !== undefined) {
        setBidColor(currentBid > prevBid ? "bg-green-300" : "bg-red-300")
      }

      setAsk(currentAsk)
      setBid(currentBid)
    }, [asset.price])


  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
        <p className="text-md font-semibold">{asset.asset}</p>
        <div className="flex gap-3 ">
          <div className={`text-md font-bold ${askColor} w-[100px] rounded-md`}>
            {asset.ask?.toFixed(3)}
          </div>
          <div className={`text-md font-bold ${bidColor} w-[100px] rounded-md`}>
            {asset.bid?.toFixed(3)}
          </div>
        </div>
    </div>
  )
}

export default AssetCard