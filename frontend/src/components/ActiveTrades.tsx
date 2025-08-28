import type { ActiveTradeType } from "../types/main-types"

const ActiveTrades = ({ trades, closeOrder }: {
  trades: ActiveTradeType[]
  closeOrder : (orderId: number) => void
}) => {
  return (
    <div className="mt-5 mx-5">
      {trades.length > 0 ? (
        <div>
          {/* Header row */}
          <div className="w-full rounded-xl px-5 flex mb-2 font-semibold">
            <p className="flex-1">Asset</p>
            <p className="flex-1">Type</p>
            <p className="flex-1">Open Price</p>
            <p className="flex-1">Current Price</p>
            <p className="flex-1">Profit/Loss</p>
            <p className="flex-0.5 text-center">Close</p>
          </div>
          
          {/* Trade rows */}
          {trades.map((trade, index) => {
            const colour = trade.pnl < 0 ? 'text-red-600' : 'text-green-600'
            return (
              <div
                key={index}
                className="w-full border-2 border-neutral-400 rounded-xl px-5 py-5 flex mb-5"
              >
                <p className="flex-1">{trade.asset}</p>
                <p className="flex-1">{trade.type}</p>
                <p className="flex-1">{trade.open_price.toFixed(3)}</p>
                <p className="flex-1">{trade.current_price.toFixed(3)}</p>
                <p className={`flex-1 ${colour}`}>{trade.pnl.toFixed(2)}</p>
                <button onClick={() => closeOrder(trade.orderId)}
                className="flex-0.5 bg-red-300 px-3 rounded-md hover:cursor-pointer hover:bg-red-400 transition-all duration-200">
                  X
                </button>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="w-full border-2 border-neutral-400 rounded-xl px-5 py-5">
          No Active Trades
        </p>
      )}
    </div>
  )
}

export default ActiveTrades