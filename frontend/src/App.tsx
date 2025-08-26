import './App.css'
import CandlestickChart from './components/CandlestickChart'
import Prices from './components/Prices'

const App = () => {
  return (
    <div className="flex h-screen">
      <div className="w-1/3 p-4">
        <Prices />
      </div>
      <div className="w-2/3">
        <CandlestickChart />
      </div>
    </div>
  )
}

export default App