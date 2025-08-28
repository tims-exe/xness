import { useState } from "react"

interface TradeSectionProp {
    handleOrder : (volume: number, leverage: number) => void
    errorMsg: string
    tradeType: "Buy" | "Sell"
    handleTradeType: (type: "Buy" | "Sell") => void
}

const TradeSection = ({handleOrder, errorMsg, tradeType, handleTradeType} : TradeSectionProp) => {
  const [volume, setVolume] = useState("");
  const [leverage, setLeverage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!volume || !leverage) {
      return; 
    }
    
    // const volumeNum = Number(volume);
    // const leverageNum = Number(leverage);
    
    setIsLoading(true);
    try {
      handleOrder(Number(volume), Number(leverage));
    } catch (error) {
      console.error("Error executing order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col mr-10 mt-10 ">
        <p className="font-bold text-2xl mb-5">Trade</p>
        <div className="flex gap-5 mb-10">
            <button onClick={() => handleTradeType("Buy")}
            className={`flex-1 py-3 rounded-2xl hover:cursor-pointer transition-all duration-200 ${
                tradeType === "Buy"
                ? 'bg-red-300 hover:bg-red-400 border-2 border-red-400'
                : 'border-red-300 border-2 hover:bg-red-100'
            }`}>
                Buy
            </button>
            <button onClick={() => handleTradeType("Sell")}
            className={`flex-1 py-3 rounded-2xl hover:cursor-pointer transition-all duration-200 ${
                tradeType === "Sell"
                ? 'bg-blue-300 hover:bg-blue-400 border-blue-400'
                : 'border-blue-300 border-2 hover:bg-blue-100'
            }`}>
                Sell
            </button>
        </div>
        <div className="flex gap-5 items-center font-semibold">
            <p className="flex-1">Volume</p>
            <input  
            type="text"
            inputMode="decimal"
            pattern="[0-9]*\.?[0-9]*"
            value={volume}
            onChange={(e) => {
                const val = e.target.value;
                if (/^\d*\.?\d*$/.test(val)) {
                    setVolume(val === "" ? "" : val.toString());
                }
            }}
            className="border-2 border-neutral-400 w-full rounded-md px-2 py-3 flex-2" 
            />
        </div>
        <p className="self-end mt-2 text-sm text-red-600">
            {errorMsg}
        </p>
        <div className="flex gap-5 items-center font-semibold">
            <p className="flex-1">Leverage</p>
            <input 
                type="number"
                min={1}
                max={100}
                step={1}
                value={leverage}
                onChange={(e) => {
                const val = e.target.value;
                if (val === "") {
                    setLeverage("")
                    return;
                }
                const num = Number(val);
                if (num >= 1 && num <= 100) {
                    setLeverage(num.toString());
                }
                }}

            className="border-2 border-neutral-400 w-full rounded-md px-2 py-3 flex-2" 
            />
        </div>
        {/* <div className="flex gap-5 items-center font-semibold mt-2">
            <p className="flex-1">Take Profit</p>
            <input  
            type="text"
            inputMode="decimal"
            pattern="[0-9]*\.?[0-9]*"
            value={volume}
            onChange={(e) => {
                const val = e.target.value;
                if (/^\d*\.?\d*$/.test(val)) {
                    setVolume(val);
                }
            }}
            className="border-2 border-neutral-400 w-full rounded-md px-2 py-3 flex-2" 
            placeholder="Enter volume"
            />
        </div>
        <div className="flex gap-5 items-center font-semibold mt-2">
            <p className="flex-1">Stop Loss</p>
            <input  
            type="text"
            inputMode="decimal"
            pattern="[0-9]*\.?[0-9]*"
            value={volume}
            onChange={(e) => {
                const val = e.target.value;
                if (/^\d*\.?\d*$/.test(val)) {
                    setVolume(val);
                }
            }}
            className="border-2 border-neutral-400 w-full rounded-md px-2 py-3 flex-2" 
            placeholder="Enter volume"
            />
        </div> */}
        <div className="mx-10">
            <button 
            onClick={handleConfirm}
            disabled={isLoading || !volume || !leverage}
            className={`py-3 rounded-2xl mt-7 w-full transition-all duration-300 ${
              isLoading || !volume || !leverage 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-green-300 hover:cursor-pointer hover:shadow-xl'
            }`}
            >
                {isLoading ? 'Processing...' : 'Confirm'}
            </button>
        </div>
    </div>
  )
}

export default TradeSection