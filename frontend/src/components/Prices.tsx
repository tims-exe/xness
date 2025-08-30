import AssetCard from "./Asset";
import type { AssetData } from "../types/main-types";

interface PriceProps {
  assetMap: Record<string, AssetData>;
  changeAsset: (asset: string) => void;
}

const Prices = ({ assetMap, changeAsset }: PriceProps) => {
  const assetEntries = Object.entries(assetMap); 
  
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
      {assetEntries.length ? (
        assetEntries.map(([assetName, assetData]) => (
          <button
            key={assetName}
            onClick={() => handleAssetClick(assetName)}
            className="hover:cursor-pointer w-full hover:shadow-lg rounded-2xl mt-5 transition-shadow duration-300"
          >
            <AssetCard asset={assetName} data={assetData} />
          </button>
        ))
      ) : (
        <p>no assets</p>
      )}
    </div>
  );
};

export default Prices;
