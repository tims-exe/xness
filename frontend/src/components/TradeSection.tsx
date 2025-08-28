import { useState } from "react"

interface TradeSectionProp {
    handleOrder : (volume: number, leverage: number) => void
    errorMsg: string
}

const TradeSection = ({handleOrder, errorMsg} : TradeSectionProp) => {
  const [volume, setVolume] = useState("");
  const [leverage, setLeverage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!volume || !leverage) {
      return; 
    }
    
    const volumeNum = Number(volume);
    const leverageNum = Number(leverage);
    
    // Validate numbers
    if (isNaN(volumeNum) || isNaN(leverageNum) || volumeNum <= 0 || leverageNum <= 0) {
      return; 
    }
    
    setIsLoading(true);
    try {
      await handleOrder(volumeNum, leverageNum);
    } catch (error) {
      console.error("Error executing order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col mr-10 mt-10 ">
        <div className="flex gap-5 mb-10">
            <button className="flex-1 bg-red-300 py-3 rounded-2xl">
                Buy
            </button>
            <button className="flex-1 border-2 border-blue-300 py-3 rounded-2xl">
                Sell
            </button>
        </div>
        <div className="flex gap-5 items-center font-semibold">
            <p>Volume</p>
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
            className="border-2 border-neutral-400 w-full rounded-md px-2 py-3" 
            placeholder="Enter volume"
            />
        </div>
        <p className="self-end mt-2 text-sm text-red-600">
            {errorMsg}
        </p>
        <div className="flex gap-5 items-center font-semibold">
            <p>Leverage</p>
            <input 
            type="text"
            inputMode="decimal"
            pattern="[0-9]*\.?[0-9]*"
            value={leverage}
            onChange={(e) => {
                const val = e.target.value;
                if (/^\d*\.?\d*$/.test(val)) {
                    setLeverage(val);
                }
            }}
            className="border-2 border-neutral-400 w-full rounded-md px-2 py-3" 
            placeholder="Enter leverage"
            />
        </div>
        <div className="mx-10">
            <button 
            onClick={handleConfirm}
            disabled={isLoading || !volume || !leverage}
            className={`py-3 rounded-2xl mt-10 w-full transition-all duration-300 ${
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