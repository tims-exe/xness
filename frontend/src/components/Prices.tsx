// import { useEffect, useState } from "react";
// import { useSocket } from "../hooks/useSocket";
import AssetCard from "./Asset";
import type { AssetData } from "../types/main-types";

interface PriceProps {
    assetMap: Record<string, AssetData>,
    changeAsset: (asset: string) => void
}

const Prices = ({assetMap, changeAsset} : PriceProps) => {

  const assets = Object.values(assetMap);

  function handleAssetClick(asset: AssetData) {
    changeAsset(asset.asset)
  }

  return (
    <div className="">
      <div className="mt-5 ml-3 flex justify-between items-center">
        <p className="font-bold text-2xl">Assets</p>
        <div className="flex w-[260px] justify-center gap-20 font-semibold self-end text-lg">
            <p>Ask</p>
            <p>Bid</p>
        </div>
      </div>
      {assets.length ? (
        assets.map((a) => (
          <button
          key={a.asset}
            onClick={() => {
                handleAssetClick(a)
            }}
            className="hover:cursor-pointer w-full hover:shadow-lg rounded-2xl mt-5 transition-shadow duration-300"
          >
            <AssetCard asset={a}/>
          </button>
        ))
      ) : (
        <p>no assets</p>
      )}
    </div>
  );
};

export default Prices;
