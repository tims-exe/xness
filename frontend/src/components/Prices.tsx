import AssetCard from "./Asset";
import type { AssetData } from "../types/main-types";

interface PriceProps {
  assetMap: AssetData[],
  changeAsset: (asset: string) => void;
}

const Prices = ({ assetMap, changeAsset }: PriceProps) => {
  
  function handleAssetClick(asset: string) {
    changeAsset(asset);
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
      {
        assetMap.map((assets) => (
          <button
            key={assets.symbol}
            onClick={() => handleAssetClick(assets.symbol)}
            className="hover:cursor-pointer w-full hover:shadow-lg rounded-2xl mt-5 transition-shadow duration-300"
          >
            <AssetCard asset={assets}/>
          </button>
        ))
      }
    </div>
  );
};

export default Prices;
