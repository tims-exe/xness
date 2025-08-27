import { useEffect, useState } from 'react'
import './App.css'
import ChartView from './components/ChartView'
import Navbar from './components/Navbar'
import Prices from './components/Prices'
import type { AssetData, TradeData } from './types/main-types'
import axios from 'axios'
import TradeSection from './components/TradeSection'
import { useSocket } from './hooks/useSocket'

const App = () => {
  const [trades, setTrades] = useState<TradeData[]>();
  const [asset, setAsset] = useState("BTCUSDT");
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('1m')
  const [balance, setBalance] = useState(10000);
  const [displayBalance, setDisplayBalance] = useState(10000);
  const { socket, loading } = useSocket();
  const [assetMap, setAssetMap] = useState<Record<string, AssetData>>({});
  const [openTrade, setOpenTrade] = useState<boolean>(false)
  const [vol, setVol] = useState(0);

  const userId = 1;
  const spread = 0.025
  const halfSpread = spread / 2

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

  useEffect(() => {
    const fetchBalance = async () => {
      const response = await axios.get(`${BACKEND_URL}/api/get-balance/${userId}`)
      setBalance(response.data.balance)
    }

    fetchBalance()
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
      const currentBid = assetData.price * (1 - halfSpread);        
      const positionValue = currentBid * vol 

      setDisplayBalance(balance + positionValue)
    }
  }, [assetMap, openTrade, vol, asset]);

  const changeAsset = (newAsset: string) => {
    setAsset(newAsset)
  }

  const changeTimePeriod = (newTimePeriod: string) => {
    setSelectedTimePeriod(newTimePeriod);
  }

  const executeOrder = async (volume: number) => {
    const body = {
      type: "Buy",
      quantity: volume,
      asset: asset,
    }

    console.log(body)

    const response = await axios.post(`${BACKEND_URL}/api/open/${userId}`, body)

    const data = response.data;
    console.log(data)
    setBalance(data.balance)
    setOpenTrade(true)
    setVol(volume);
  }

  return (
    <div className="flex flex-col h-screen">
      <Navbar balance={displayBalance} />
      <div className='flex'>
        <div className="w-1/4 p-4">
          <Prices assetMap={assetMap} changeAsset={changeAsset} />
        </div>
        <div className="w-2/4">
          {trades ? <ChartView
            trades={trades} asset={asset} loading={loading} selectedTimePeriod={selectedTimePeriod} onTimePeriodChange={changeTimePeriod}
          /> : <p>no trades</p>}
        </div>
        <div className='w-1/4'>
          <TradeSection handleOrder={executeOrder} />
        </div>
      </div>
    </div>
  )
}

export default App