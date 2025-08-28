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
  const [balance, setBalance] = useState<number>(0)
  const [originalBalance, setOriginalBalance] = useState<number>(0);
  const { socket, loading } = useSocket();
  
  const [isTradeLiv, setIsTradeLive] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [tradeType, setTradeType] = useState<"Buy"| "Sell">("Buy");
  const [activeTrades, setActiveTrades] = useState<ActiveTradeType[]>([]);
  
  const userId = 1;

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
      try {
        const response_balance = await axios.get(`${BACKEND_URL}/api/get-balance/${userId}`)
        const response_orders = await axios.get(`${BACKEND_URL}/api/get-orders/${userId}`)

        if (response_orders.data?.length > 0) {
          setIsTradeLive(true)
        }
        setActiveTrades(response_orders.data || [])
        
        setBalance(response_balance.data.balance)
        setOriginalBalance(response_balance.data.balance)
      } catch (error) {
        console.error('Error fetching initial data:', error)
        setActiveTrades([])
      }
    }

    fetchData()
  }, [])


  // get live data from websocket server
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
    if (isTradeLiv) {
      setActiveTrades((prev) => {
        const updatedTrades = prev.map(trade => {
          if (assetMap[trade.asset]) {
            const currentBid = assetMap[trade.asset].bid;
            const current_pnl = (currentBid - trade.open_price) * trade.volume;
            return {
              ...trade,
              current_price: currentBid,
              pnl: current_pnl
            };
          }
          return trade;
        });

        const totalPnL = updatedTrades.reduce((sum, trade) => sum + trade.pnl, 0);

        // console.log(totalPnL)
        
        setBalance(originalBalance + totalPnL);

        return updatedTrades;
      });
      
    }
  }, [assetMap, isTradeLiv, originalBalance]); 
  const changeAsset = (newAsset: string) => {
    setAsset(newAsset)
  }

  const changeTimePeriod = (newTimePeriod: string) => {
    setSelectedTimePeriod(newTimePeriod);
  }

  function checkOpenTrades() {
    if (ActiveTrades.length > 0){
      setIsTradeLive(true)
    }
    else {
      setIsTradeLive(false)
    }
  }


  const executeOrder = async (volume: number, leverage: number) => {
    const body = {
      userId: userId,
      type: tradeType,
      volume: volume,
      asset: asset,
      leverage: leverage
    }

    // console.log(body)

    const response = await axios.post(`${BACKEND_URL}/api/open/`, body)

    const data = response.data;

    if (data.message) {
      setErrorMsg(data.message)
      return
    }
    setBalance(data.balance);
    setOriginalBalance(data.balance);
    setErrorMsg("")
    setIsTradeLive(true)
    // setCurrentPrice(data.current_price)

    // console.log(data.orderId)

    const currentTrade: ActiveTradeType = {
      orderId: data.orderId,
      asset: asset,
      type: tradeType,
      open_price: data.open_price,
      current_price: data.current_price,
      volume: volume,
      pnl: (data.current_price - data.open_price) * volume
    }

    // console.log(currentTrade)

    setActiveTrades((prev) => [...prev, currentTrade])
    // ActiveTrades.push()
  }

  const closeOrder = async (orderId: number) => {
    console.log('closing')

    console.log(activeTrades);
    
    const body = {
      userId: userId,
      orderId: orderId
    }

    const response = await axios.post(`${BACKEND_URL}/api/close`, body)

    const data = response.data;

    console.log(data)
    if (data.status === "failed") {
      console.log(data.message)
      return
    }

    setActiveTrades((prev) => prev.filter(trade => trade.orderId !== orderId));
    setBalance(data.message)
    setOriginalBalance(data.message);
    checkOpenTrades();
  }

  return (
    <div className="flex flex-col h-screen">
      <Navbar balance={balance} />
      <div className='flex'>
        <div className="w-2/6 p-4">
          <Prices assetMap={assetMap} changeAsset={changeAsset}/>
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
          <ActiveTrades trades={activeTrades} closeOrder={closeOrder}/>
        </div>
      </div>
    </div>
  )
}

export default App