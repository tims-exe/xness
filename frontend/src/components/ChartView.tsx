import React from 'react';
import TradeChart from './TradeChart';
import type { AssetData, TimePeriod, TradeData } from '../types/main-types';
import type { CandlestickData, Time } from 'lightweight-charts';

const TIME_PERIODS: TimePeriod[] = [
    { value: '1m', label: '1 Minute', ms: 60*1000 },
    { value: '5m', label: '5 Minutes', ms: 5*60*1000 },
    { value: '15m', label: '15 Minutes', ms: 15*60*1000 },
    { value: '30m', label: '30 Minutes', ms: 30*60*1000 },
];

interface ChartViewProps {
    loading: boolean;
    trades: TradeData[];
    asset: string;
    selectedTimePeriod: string;
    onTimePeriodChange: (timePeriod: string) => void;
    assetMap : Record<string, AssetData>
}

const ChartView: React.FC<ChartViewProps> = ({
    loading, 
    trades, 
    asset, 
    selectedTimePeriod, 
    onTimePeriodChange,
    assetMap
}) => {        

    const handleTimePeriodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        onTimePeriodChange(event.target.value);
    };

    const transformToCandles = (tradeData: TradeData[]): CandlestickData[] => {
        return tradeData.map(trade => ({
            time: Math.floor(new Date(trade.timestamp).getTime() / 1000) as Time,
            open: trade.open_price,   
            high: trade.high_price,   
            low: trade.low_price,    
            close: trade.close_price   
        })).sort((a, b) => (a.time as number) - (b.time as number));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading trade data...</p>
                </div>
            </div>
        );
    }

    if (!trades || trades.length === 0) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <p className="text-gray-600">No trade data available</p>
                </div>
            </div>
        );
    }

    const candleData = transformToCandles(trades);

    return (
        <div className="w-full">
            <div className="bg-white rounded-lg p-10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {asset}
                    </h2>
                    <div className="flex items-center space-x-4">
                        <label className="text-sm font-medium text-gray-700">
                            Time Period
                        </label>
                        <select
                            value={selectedTimePeriod}
                            onChange={handleTimePeriodChange}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {TIME_PERIODS.map((period) => (
                                <option key={period.value} value={period.value}>
                                    {period.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <TradeChart 
                    data={candleData} 
                    asset={asset} 
                    timePeriod={selectedTimePeriod}
                    livePrice={assetMap[asset]?.price ?? 0}
                    allTimePeriods={TIME_PERIODS}
                />
            </div>
        </div>
    );
};

export default ChartView;