import { useState } from "react"

interface TradeSectionProp {
    handleOrder : (volume: number) => void
}


const TradeSection = ({handleOrder} : TradeSectionProp) => {
  const [volume, setVolume] = useState("");

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
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            type="text" className="border-2 border-neutral-400 w-full rounded-md px-2 py-3" />
        </div>
        <div className="mx-10">
            <button onClick={() => {
                handleOrder(Number(volume))
            }}
            className=" bg-green-300 py-3 rounded-2xl mt-10 w-full hover:cursor-pointer hover:shadow-xl transition-all duration-300">
                Confirm
            </button>
        </div>
    </div>
  )
}

export default TradeSection