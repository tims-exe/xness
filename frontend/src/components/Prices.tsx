import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";
import AssetCard from "./Asset";
import type { AssetData } from "../types/main-types";

interface PriceProps {
    changeAsset: (asset: string) => void
}

const Prices = ({changeAsset} : PriceProps) => {
  const { socket, loading } = useSocket();
  const [assetMap, setAssetMap] = useState<Record<string, AssetData>>({});
  const [priceColor, setPriceColour] = useState("text-green-600");

  useEffect(() => {
    if (socket && !loading) {
      socket.onmessage = (event) => {
        const assetData: AssetData = JSON.parse(event.data);

        setAssetMap((prev) => {
          const prevAsset = prev[assetData.asset];

          if (prevAsset) {
            if (assetData.price < prevAsset.price) {
              setPriceColour("text-red-600");
            } else {
              setPriceColour("text-green-600");
            }
          }

          return {
            ...prev,
            [assetData.asset]: assetData,
          };
        });
      };
      socket.onclose = () => {
        console.log("close");
      };
      return () => {
        socket.close();
      };
    }
  }, [socket, loading]);

  const assets = Object.values(assetMap);

  function handleAssetClick(asset: AssetData) {
    changeAsset(asset.asset)
  }

  return (
    <div>
      <p className="mt-5 ml-3 font-bold text-2xl">Assets</p>
      {assets.length ? (
        assets.map((a) => (
          <button
          key={a.asset}
            onClick={() => {
                handleAssetClick(a)
            }}
            className="hover:cursor-pointer w-full hover:shadow-lg rounded-2xl mt-5 transition-shadow duration-300"
          >
            <AssetCard asset={a} color={priceColor} />
          </button>
        ))
      ) : (
        <p>no assets</p>
      )}
    </div>
  );
};

export default Prices;
