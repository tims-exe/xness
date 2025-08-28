import { useState } from "react"

interface TradeSectionProp {
    handleOrder : (volume: number, leverage: number) => void
    errorMsg: string
}


const TradeSection = ({handleOrder, errorMsg} : TradeSectionProp) => {
  const [volume, setVolume] = useState("");
  const [leverage, setLeverage] = useState("");

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
            className="border-2 border-neutral-400 w-full rounded-md px-2 py-3" />
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
            className="border-2 border-neutral-400 w-full rounded-md px-2 py-3" />
        </div>
        <div className="mx-10">
            <button onClick={() => {
                handleOrder(Number(volume), Number(leverage))
            }}
            className=" bg-green-300 py-3 rounded-2xl mt-10 w-full hover:cursor-pointer hover:shadow-xl transition-all duration-300">
                Confirm
            </button>
        </div>
    </div>
  )
}

export default TradeSection