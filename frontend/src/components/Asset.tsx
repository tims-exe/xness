/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react"
import type { AssetData } from "../types/main-types"

// interface AssetCardProps {
//   asset: string;
//   data: AssetData;
// }

const AssetCard = ({ asset }: {asset: AssetData}) => {
  const [ask, setAsk] = useState<number>();
  const [bid, setBid] = useState<number>();
  // const [askColor, setAskColor] = useState<string>("bg-green-300");
  // const [bidColor, setBidColor] = useState<string>("bg-green-300");
  const [statusColour, setStatusColour] = useState<string>("bg-green-300");

  useEffect(() => {
    // const spread = 0.025;
    // const halfSpread = spread / 2;


    const currentAsk = (asset.buy / Math.pow(10, asset.decimal)) // * (1 + halfSpread);
    const currentBid = (asset.sell / Math.pow(10, asset.decimal)) // * (1 - halfSpread);

    if (asset.status === "up") {
      setStatusColour("bg-green-300")
    }
    else {
      setStatusColour("bg-red-300")
    }

    // if (prevAsk !== undefined) {
    //   setAskColor(currentAsk > prevAsk ? "bg-green-300" : "bg-red-300");
    // }

    // if (prevBid !== undefined) {
    //   setBidColor(currentBid > prevBid ? "bg-green-300" : "bg-red-300");
    // }

    setAsk(currentAsk);
    setBid(currentBid);
  }, [asset]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
      <p className="text-md font-semibold">{asset.symbol}</p>
      <div className="flex gap-3">
        <div className={`text-md font-bold ${statusColour} w-[100px] rounded-md`}>
          {ask?.toFixed(3)}
        </div>
        <div className={`text-md font-bold ${statusColour} w-[100px] rounded-md`}>
          {bid?.toFixed(3)}
        </div>
      </div>
    </div>
  );
};

export default AssetCard;
