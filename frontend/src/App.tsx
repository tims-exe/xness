import { useEffect, useRef, useState } from "react";
import "./App.css";
import ChartView from "./components/ChartView";
import Navbar from "./components/Navbar";
import Prices from "./components/Prices";
import type { ActiveTradeType } from "./types/main-types";
import axios from "axios";
import TradeSection from "./components/TradeSection";
import { useSocket } from "./hooks/useSocket";
import ActiveTrades from "./components/ActiveTrades";

const App = () => {
  const asset = useRef("BTCUSDT");
  const [balance, setBalance] = useState<number>(0);
  const [originalBalance, setOriginalBalance] = useState<number>(0);
  const { assetMap } = useSocket();

  const [isTradeLive, setIsTradeLive] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [tradeType, setTradeType] = useState<"Buy" | "Sell">("Buy");
  const [activeTrades, setActiveTrades] = useState<ActiveTradeType[]>([]);

  const userId = 1;

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


// get user balance 
  useEffect(() => {
    const fetchData = async () => {
      const response_balance = await axios.get(
        `${BACKEND_URL}/api/get-balance/${userId}`
      );
      setBalance(response_balance.data.balance);
      setOriginalBalance(response_balance.data.balance);
    };

    fetchData();
  }, [BACKEND_URL, userId]);


  // realtime live trades
  useEffect(() => {
    if (isTradeLive) {
      setActiveTrades((prev) => {
        const currentTrades = Array.isArray(prev) ? prev : [];
        
        if (currentTrades.length === 0) {
          return currentTrades;
        }

        const updatedTrades = currentTrades.map((trade) => {
          if (!trade || !trade.asset || !assetMap[trade.asset]) {
            return trade;
          }

          const currentAsset = assetMap[trade.asset];
          
          if (!currentAsset || typeof currentAsset.bid !== 'number' || typeof currentAsset.ask !== 'number') {
            return trade;
          }

          const currentPrice = trade.type === "Buy" 
            ? currentAsset.bid
            : currentAsset.ask;

          const current_pnl = trade.type === "Buy" 
            ? (currentPrice - trade.open_price) * trade.volume
            : (trade.open_price - currentPrice) * trade.volume;

          return {
            ...trade,
            current_price: currentPrice,
            pnl: current_pnl,
          };
        });

        const totalPnL = updatedTrades.reduce((sum, trade) => {
          return sum + (typeof trade.pnl === 'number' ? trade.pnl : 0);
        }, 0);

        setBalance(originalBalance + totalPnL);
        return updatedTrades;
      });
    }
  }, [assetMap, isTradeLive, originalBalance]);


  // fetch current open trades
  useEffect(() => {
    const fetchActiveTrades = async () => {
      const response_orders = await axios.get(
        `${BACKEND_URL}/api/get-orders/${userId}`
      );
      
      const tradesData = Array.isArray(response_orders.data) ? response_orders.data : [];
      
      setActiveTrades(tradesData);

      if (tradesData.length > 0) {
        setIsTradeLive(true);
      } else {
        setIsTradeLive(false);
        setBalance(originalBalance);
      }
    };

    fetchActiveTrades();
    const interval = setInterval(fetchActiveTrades, 1000);

    return () => clearInterval(interval);
  }, [BACKEND_URL, userId, originalBalance]);



  const changeAsset = (newAsset: string) => {
    asset.current = newAsset
  };

  // const changeTimePeriod = (newTimePeriod: string) => {
  //   setSelectedTimePeriod(newTimePeriod);
  // };

  const handleTradeType = (type: "Buy" | "Sell") => {
    setTradeType(type)
  }

  
  // open a trade
  const executeOrder = async (volume: number, leverage: number, takeProfit: number | null, stopLoss: number | null) => {
    const body = {
      userId: userId,
      type: tradeType,
      volume: volume,
      asset: asset.current,
      leverage: leverage,
      takeProfit: takeProfit,
      stopLoss: stopLoss
    };

    const response = await axios.post(`${BACKEND_URL}/api/open/`, body);
    const data = response.data;

    if (data.message && !data.orderId) {
        setErrorMsg(data.message);
        return;
      }

    setErrorMsg("");
    setBalance(data.balance);
    setOriginalBalance(data.balance);
    setIsTradeLive(true);

    const currentTrade: ActiveTradeType = {
      orderId: data.orderId,
      asset: asset.current,
      type: tradeType,
      open_price: data.open_price,
      current_price: data.current_price,
      volume: volume,
      pnl: tradeType === "Buy" 
        ? (data.current_price - data.open_price) * volume
        : (data.open_price - data.current_price) * volume,
      stopLoss: stopLoss,
      takeProfit: takeProfit
    };

    setActiveTrades((prev) => {
      const currentTrades = Array.isArray(prev) ? prev : [];
      return [...currentTrades, currentTrade];
    });
  };


  // close a trade
  const closeOrder = async (orderId: number) => {
    const body = {
      userId: userId,
      orderId: orderId,
    };

    const response = await axios.post(`${BACKEND_URL}/api/close`, body);
    const data = response.data;

    setActiveTrades((prev) => {
      const currentTrades = Array.isArray(prev) ? prev : [];
      return currentTrades.filter((trade) => trade.orderId !== orderId);
    });

    const newBalance = Number(data.message);
    setBalance(newBalance);
    setOriginalBalance(newBalance);

    setActiveTrades((prev) => {
      const remaining = Array.isArray(prev) ? prev.filter(trade => trade.orderId !== orderId) : [];
      if (remaining.length === 0) {
        setIsTradeLive(false);
      }
      return remaining;
    });
  };


  return (
    <div className="flex flex-col h-screen">
      <Navbar balance={balance} />
      <div className="flex">
        <div className="w-2/7 p-4">
          <Prices assetMap={assetMap} changeAsset={changeAsset} />
        </div>
        <div className="w-0.5 bg-neutral-300"></div>
        <div className="w-5/7">
          <div className="flex">
            <div className="flex-3">
              <ChartView
                asset={asset.current}
              />
            </div>
            <div className="flex-1">
              <TradeSection handleOrder={executeOrder} errorMsg={errorMsg} tradeType={tradeType} handleTradeType={handleTradeType}/>
            </div>
          </div>
          <ActiveTrades trades={activeTrades} closeOrder={closeOrder} />
        </div>
      </div>
    </div>
  );
};

export default App;