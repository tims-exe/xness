import axios from 'axios';
import { useEffect, useState } from 'react';
import Chart from "react-apexcharts";

interface TradeDate {
    timestamp: string
    asset: string
    open_price: number
    close_price: number
    high_price: number
    low_price: number 
    volume: string
}

export type Candle = {
    x: string | number | Date; 
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

const CandlestickChart = () => {
    const [trades, setTrades] = useState<TradeDate[]>();
    const [loading, setLoading] = useState(true);
    const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>('1m');
        
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const asset = "BTCUSDT";

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
    }, [BACKEND_URL, selectedTimePeriod]);

    const handleTimePeriodChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedTimePeriod(event.target.value);
    };

    const transformToCandles = (tradeData: TradeDate[]): Candle[] => {
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

    const TradeChart = ({ data }: { data: Candle[] }) => {
        const series = [
            {
                data
            },
        ];

        const options: ApexCharts.ApexOptions = {
            chart: {
                type: "candlestick",
                height: 350,
                toolbar: {
                    show: true,
                },
            },
            title: {
                text: `${asset} Candlestick Chart (${TIME_PERIODS.find(p => p.value === selectedTimePeriod)?.label})`,
                align: "left",
            },
            xaxis: {
                type: "datetime",
                labels: {
                    format: selectedTimePeriod === '1m' || selectedTimePeriod === '5m' ? 'HH:mm' : 'dd MMM HH:mm'
                }
            },
            yaxis: {
                tooltip: {
                    enabled: true,
                },
                labels: {
                    formatter: (value: number) => `$${value.toLocaleString()}`
                }
            },
        };

        return (
            <div className="w-full rounded-2xl shadow-sm border border-gray-200 p-4 bg-white">
                <Chart
                    options={options}
                    series={series}
                    type="candlestick"
                    height={350}
                />
            </div>
        );
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
        <div className="p-4">
            <div className="mb-4">
                <label htmlFor="time-period" className="block text-sm font-medium text-gray-700 mb-2">
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
            <TradeChart data={transformToCandles(trades)} />
        </div>
    );
};

export default CandlestickChart;