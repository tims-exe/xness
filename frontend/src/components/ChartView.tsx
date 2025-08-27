import TradeChart from './TradeChart';
import type { TradeData } from '../types/main-types';

export type Candle = {
    x: Date; 
    y: [number, number, number, number];
};

type TimePeriod = {
    value: string;
    label: string;
};

const TIME_PERIODS: TimePeriod[] = [
    { value: '1m', label: '1 Minute' },
    { value: '5m', label: '5 Minutes' },
    { value: '15m', label: '15 Minutes' },
    { value: '30m', label: '30 Minutes' },
];

const ChartView = ({loading, trades, asset, selectedTimePeriod, onTimePeriodChange}: {
    loading: boolean 
    trades: TradeData[]
    asset: string
    selectedTimePeriod: string 
    onTimePeriodChange : (timePeriod: string) => void
}) => {        

    const handleTimePeriodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        onTimePeriodChange(event.target.value);
    };

    const transformToCandles = (tradeData: TradeData[]): Candle[] => {
        return tradeData.map(trade => ({
            x: new Date(trade.timestamp),
            y: [
                trade.open_price,   
                trade.high_price,   
                trade.low_price,    
                trade.close_price   
            ]
        }));
    };

    

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-lg">Loading trade data...</div>
            </div>
        );
    }

    if (!trades || trades.length === 0) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-gray-500 text-lg">No trade data available</div>
            </div>
        );
    }

    return (
        <div className="p-4 flex flex-col justify-end items-end">
            <div className="mb-4 flex items-center justify-between w-full px-3">
                <p className='font-bold text-2xl'>
                    {asset}
                </p>
                <div className='flex flex-col'>
                    <label htmlFor="time-period" className="block text-sm font-medium text-gray-700 mb-2 self-end">
                        Time Period
                    </label>
                    <select
                        id="time-period"
                        value={selectedTimePeriod}
                        onChange={handleTimePeriodChange}
                        className="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                    >
                        {TIME_PERIODS.map((period) => (
                            <option key={period.value} value={period.value}>
                                {period.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <TradeChart data={transformToCandles(trades)} asset={asset} timePeriod={selectedTimePeriod} />
        </div>
    );
};

export default ChartView;