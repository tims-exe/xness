import type { AssetData } from "../types/main-types"

const AssetCard = ({ asset, color }: {
  asset: AssetData,
  color: string
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
        <p className="text-md font-semibold">{asset.asset}</p>
        <p className={`text-md font-bold ${color}`}>{asset.price}</p>
    </div>
  )
}

export default AssetCard