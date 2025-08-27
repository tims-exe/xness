import type { ActiveTradeType } from "../types/main-types"

const ActiveTrades = ({trades, currentPrice } : {
    trades: ActiveTradeType[]
    currentPrice: number
}) => {
    console.log(trades)
  return (
    <div className="mt-10 mx-5">
        {trades.length > 0? <div>
            {trades.map((trade, index) => (
                <div key={index} className="w-full border-2 border-neutral-400 rounded-xl px-5 py-5 flex mb-5">
                    <p className="flex-1">
                        {trade.asset}
                    </p>
                    <p className="flex-1">
                        {trade.type}
                    </p>
                    <p className="flex-1"> 
                        {trade.open_price.toFixed(3)}
                    </p>
                    <p className="flex-1">
                        {currentPrice.toFixed(3)}
                    </p>
                    <button className="flex-0.5 bg-red-300 px-3 rounded-md hover:cursor-pointer hover:bg-red-400 transition-all duration-200">
                        X
                    </button>
                </div>
            ))}
        </div> : <p className="w-full border-2 border-neutral-400 rounded-xl px-5 py-5">No Active Trades</p>}
    </div>
  )
}

export default ActiveTrades