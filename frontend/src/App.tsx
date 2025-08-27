import { useEffect, useState } from 'react'
import './App.css'
import ChartView from './components/ChartView'
import Navbar from './components/Navbar'
import Prices from './components/Prices'
import type { TradeData } from './types/main-types'
import axios from 'axios'
import TradeSection from './components/TradeSection'



const App = () => {
  const [trades, setTrades] = useState<TradeData[]>();
  const [loading, setLoading] = useState(true);
  const [asset, setAsset] = useState("BTCUSDT");
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('1m')

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
      // const asset = [
      //     "BTCUSDT",
      //     "ETHUSDT"
      // ];
      
      useEffect(() => {
          const fetchTrades = async () => {
              try {
                  setLoading(true);
                  const response = await axios.get(`${BACKEND_URL}/api/trades/${asset}/${selectedTimePeriod}`);
                  setTrades(response.data);
              } catch (err) {
                  console.error('Error fetching trades:', err);
              } finally {
                  setLoading(false);
              }
          }; 
  
          fetchTrades();
      }, [BACKEND_URL, selectedTimePeriod, asset]);

      const changeAsset = (newAsset : string) => {
        setAsset(newAsset)
      }

      const changeTimePeriod = (newTimePeriod: string) => {
        setSelectedTimePeriod(newTimePeriod);
      }
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
        <div className='flex'>
          <div className="w-1/4 p-4">
            <Prices changeAsset={changeAsset}/>
          </div>
          <div className="w-2/4">
            {trades ? <ChartView 
              trades={trades} asset={asset} loading={loading} selectedTimePeriod={selectedTimePeriod} onTimePeriodChange={changeTimePeriod}
              /> : <p>no trades</p>} 
          </div>
          <div className='w-1/4'>
            <TradeSection />
          </div>
        </div>
    </div>
  )
}

export default App