import React, { useEffect, useState } from 'react';
import TradeChart from './TradeChart';
import type { TimePeriod, TradeData } from '../types/main-types';
import type { CandlestickData, UTCTimestamp } from 'lightweight-charts';
import axios from 'axios';

const TIME_PERIODS: TimePeriod[] = [
    { value: '1m', label: '1 Minute', ms: 60*1000 },
    { value: '5m', label: '5 Minutes', ms: 5*60*1000 },
    { value: '15m', label: '15 Minutes', ms: 15*60*1000 },
    { value: '30m', label: '30 Minutes', ms: 30*60*1000 },
];

const ChartView = ({asset} : {asset : string}) => {        
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const [trades, setTrades] = useState<TradeData[]>([]);
    const [selectedTimePeriod, setSelectedTimePeriod] = useState("1m");

    const token = localStorage.getItem("token")

    // get trade history (chart)
    useEffect(() => {
        const fetchTrades = async () => {
            const response = await axios.get(
                `${BACKEND_URL}/api/v1/candles?asset=${asset}&ts=${selectedTimePeriod}`, {
                headers : {
                    Authorization: token
                }
            }
            );

            setTrades(response.data || []); 
            //console.log(response.data)
        };

        fetchTrades();
    }, [BACKEND_URL, selectedTimePeriod, asset]);

    const handleTimePeriodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedTimePeriod(event.target.value);
    };

    const transformToCandles = (tradeData: TradeData[]): CandlestickData[] => {
        return tradeData.map(trade => ({
            time: Math.floor(Number(trade.timestamp)) as UTCTimestamp,
            open: trade.open_price / Math.pow(10, trade.max_decimals),   
            high: trade.high_price / Math.pow(10, trade.max_decimals),   
            low: trade.low_price / Math.pow(10, trade.max_decimals),    
            close: trade.close_price / Math.pow(10, trade.max_decimals), 
        })).sort((a, b) => (a.time as number) - (b.time as number));
    };


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
                    allTimePeriods={TIME_PERIODS}
                    selectedTimePeriod={selectedTimePeriod}
                />
            </div>
        </div>
    );
};

export default React.memo(ChartView);
