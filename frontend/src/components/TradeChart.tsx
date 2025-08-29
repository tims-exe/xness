import { useEffect, useRef } from 'react';
import { 
    createChart, 
    ColorType,
    type IChartApi, 
    type ISeriesApi, 
    type CandlestickData, 
    // type Time,
    CandlestickSeries
} from 'lightweight-charts';
import type { ChartColors, TimePeriod } from '../types/main-types';

interface TradeChartProps {
    data: CandlestickData[];
    asset: string;
    timePeriod: string;
    colors?: ChartColors;
    livePrice: number;
    allTimePeriods: TimePeriod[]
}

// const getCurrentCandleStartTime = (timePeriod: string, allTimePeriods: TimePeriod[]): number => {
//     const now = Date.now();
//     const period = allTimePeriods.find(tp => tp.value === timePeriod);
//     const periodMs = period ? period.ms : 60*1000;
//     return Math.floor(now / periodMs) * periodMs;
// };

const TradeChart = ({ 
    data, 
    colors: {
        backgroundColor = '#ffffff',
        textColor = '#333',
        upColor = '#26a69a',
        downColor = '#ef5350',
        wickUpColor = '#26a69a',
        wickDownColor = '#ef5350',
    } = {},
    // timePeriod,
    // livePrice, 
    // allTimePeriods
}: TradeChartProps) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
    const currentCandleRef = useRef<CandlestickData | null>(null);
    const currentCandleStartTimeRef = useRef<number | null>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart: IChartApi = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: 350,
            layout: {
                background: { type: ColorType.Solid, color: backgroundColor },
                textColor,
            },
            grid: {
                vertLines: { color: 'rgba(197, 203, 206, 0.5)' },
                horzLines: { color: 'rgba(197, 203, 206, 0.5)' },
            },
            timeScale: {
                borderColor: '#485c7b',
                timeVisible: true,
                secondsVisible: false,
                // Display time in local timezone
                tickMarkFormatter: (time: number) => {
                    const date = new Date(time * 1000);
                    return date.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: false 
                    });
                },
            },
            rightPriceScale: {
                borderColor: '#485c7b',
            },
        });

        const series: ISeriesApi<'Candlestick'> = chart.addSeries(CandlestickSeries, {
            upColor,
            downColor,
            borderVisible: false,
            wickUpColor,
            wickDownColor,
        });

        chartRef.current = chart;
        seriesRef.current = series;

        const handleResize = () => {
            if (chartContainerRef.current && chart) {
                chart.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [backgroundColor, textColor, upColor, downColor, wickUpColor, wickDownColor]);

    // Initialize chart with historical data
    useEffect(() => {
        if (!seriesRef.current || !data || data.length === 0) return;

        seriesRef.current.setData(data);
        
        if (chartRef.current) {
            chartRef.current.timeScale().fitContent();
        }

        // Reset current candle when data changes
        currentCandleRef.current = null;
        currentCandleStartTimeRef.current = null;
    }, [data]);

    // // Handle live price updates - simplified like the reference
    // useEffect(() => {
    //     if (!seriesRef.current || !livePrice || !data || data.length === 0) return;

    //     const currentCandleStartTime = getCurrentCandleStartTime(timePeriod, allTimePeriods);
    //     const timeInSeconds = Math.floor(currentCandleStartTime / 1000) as Time;

    //     // Check if we need a new candle based on the candle start time, not the current candle time
    //     const needNewCandle = currentCandleStartTimeRef.current === null || 
    //                          currentCandleStartTime !== currentCandleStartTimeRef.current;

    //     if (needNewCandle) {
    //         // Create new candle
    //         const newCandle: CandlestickData = {
    //             time: timeInSeconds,
    //             open: livePrice,
    //             high: livePrice,
    //             low: livePrice,
    //             close: livePrice,
    //         };

    //         currentCandleRef.current = newCandle;
    //         currentCandleStartTimeRef.current = currentCandleStartTime;
    //         // Single update call - chart handles appending/updating automatically
    //         seriesRef.current.update(newCandle);
            
    //         console.log(`New candle created for ${new Date(Number(timeInSeconds) * 1000).toLocaleTimeString()}`);
    //     } else if (currentCandleRef.current) {
    //         // Update existing candle
    //         const updatedCandle: CandlestickData = {
    //             time: currentCandleRef.current.time,
    //             open: currentCandleRef.current.open,
    //             high: Math.max(currentCandleRef.current.high, livePrice),
    //             low: Math.min(currentCandleRef.current.low, livePrice),
    //             close: livePrice,
    //         };

    //         currentCandleRef.current = updatedCandle;
    //         // Single update call - chart handles the rest
    //         seriesRef.current.update(updatedCandle);
    //     }

    //     // Auto-scroll to show latest data
    //     chartRef.current?.timeScale().scrollToRealTime();
    // }, [livePrice, timePeriod, allTimePeriods]);

    return <div ref={chartContainerRef} style={{ width: '100%', height: '350px' }} />;
};

export default TradeChart;