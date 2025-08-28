/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import './App.css'
import ChartView from './components/ChartView'
import Navbar from './components/Navbar'
import Prices from './components/Prices'
import type { ActiveTradeType, AssetData, TradeData } from './types/main-types'
import axios from 'axios'
import TradeSection from './components/TradeSection'
import { useSocket } from './hooks/useSocket'
import ActiveTrades from './components/ActiveTrades'

const App = () => {
  const [trades, setTrades] = useState<TradeData[]>();
  const [asset, setAsset] = useState("BTCUSDT");
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('1m')
  const [balance, setBalance] = useState(10000);
  const [displayBalance, setDisplayBalance] = useState(10000);
  const { socket, loading } = useSocket();
  
  const [openTrade, setOpenTrade] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState("");
  const [vol, setVol] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [tradeType, setTradeType] = useState<"Buy"| "Sell">("Buy");
  const [activeTrades, setActiveTrades] = useState<ActiveTradeType[]>([]);
//   const [currentPrice, setCurrentPrice] = useState<number>(0);
//   const [bid, setBid] = useState<number>();

  // const ActiveTrades: ActiveTradeType[] = [];

  const userId = 1;
//   const spread = 0.025
//   const halfSpread = spread / 2

  const [assetMap, setAssetMap] = useState<Record<string, AssetData>>({});

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/trades/${asset}/${selectedTimePeriod}`);
        setTrades(response.data);
      } catch (err) {
        console.error('Error fetching trades:', err);
      }
    };

    fetchTrades();
  }, [BACKEND_URL, selectedTimePeriod, asset]);



  // fetch initial balance and orders
  useEffect(() => {
    const fetchData = async () => {
      const response_balance = await axios.get(`${BACKEND_URL}/api/get-balance/${userId}`)
      const response_orders = await axios.get(`${BACKEND_URL}/api/get-orders/${userId}`)

    //   console.log(response_orders.data);

      setActiveTrades(response_orders.data)
      
      setBalance(response_balance.data.balance)
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (socket && !loading) {
      socket.onmessage = (event) => {
        const assetData: AssetData = JSON.parse(event.data);
        setAssetMap((prev) => ({
          ...prev,
          [assetData.asset]: assetData
        }));
      };
      socket.onclose = () => {
        console.log("close");
      };
      return () => {
        socket.close();
      };
    }
  }, [socket, loading]);

  useEffect(() => {
    if (openTrade && assetMap[asset]) {

      const assetData = assetMap[asset];    
      const currentBid = assetData.bid;        
      const positionValue = currentBid * vol 

      setDisplayBalance(balance + positionValue)
    //   setCurrentPrice(currentBid);
    }
  }, [assetMap, openTrade, vol, asset]);

  const changeAsset = (newAsset: string) => {
    setAsset(newAsset)
  }

  const changeTimePeriod = (newTimePeriod: string) => {
    setSelectedTimePeriod(newTimePeriod);
  }

  const executeOrder = async (volume: number, leverage: number) => {
    const body = {
      type: tradeType,
      volume: volume,
      asset: asset,
      leverage: leverage
    }

    // console.log(body)

    const response = await axios.post(`${BACKEND_URL}/api/open/${userId}`, body)

    const data = response.data;

    if (data.message) {
      setErrorMsg(data.message)
      return
    }
    setBalance(data.balance)
    setErrorMsg("")
    setOpenTrade(true)
    setVol(volume);
    // setCurrentPrice(data.current_price)

    const currentTrade: ActiveTradeType = {
      orderId: data.orderId,
      asset: asset,
      type: tradeType,
      open_price: data.open_price,
      current_price: data.current_price,
      volume: volume
    }

    // console.log(currentTrade)

    setActiveTrades((prev) => [...prev, currentTrade])
    // ActiveTrades.push()
  }

  return (
    <div className="flex flex-col h-screen">
      <Navbar balance={displayBalance} />
      <div className='flex'>
        <div className="w-2/6 p-4">
          <Prices assetMap={assetMap} changeAsset={changeAsset} />
        </div>
        <div className="w-0.5 bg-neutral-300"></div>
        <div className='w-4/6'>  
          <div className='flex'>  
            <div className="flex-2">
              {trades ? <ChartView
                trades={trades} asset={asset} loading={loading} selectedTimePeriod={selectedTimePeriod} onTimePeriodChange={changeTimePeriod}
              /> : <p>no trades</p>}
            </div>
            <div className='flex-1'>
              <TradeSection handleOrder={executeOrder} errorMsg={errorMsg}/>
            </div>
          </div>
          <ActiveTrades trades={activeTrades} assetMap={assetMap}/>
        </div>
      </div>
    </div>
  )
}

export default App