/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from 'react';
import { 
    createChart, 
    ColorType,
    type IChartApi, 
    type ISeriesApi, 
    type CandlestickData, 
    type UTCTimestamp,
    CandlestickSeries
} from 'lightweight-charts';
import type { ChartColors, TimePeriod } from '../types/main-types';

import { useSocket } from '../hooks/useSocket';

interface TradeChartProps {
    data: CandlestickData[];
    asset: string;
    timePeriod: string;
    colors?: ChartColors;
    allTimePeriods: TimePeriod[],
    selectedTimePeriod: string
}
const TradeChart = ({ 
    data, 
    timePeriod,
    allTimePeriods,
    colors: {
        backgroundColor = '#ffffff',
        textColor = '#333',
        upColor = '#26a69a',
        downColor = '#ef5350',
        wickUpColor = '#26a69a',
        wickDownColor = '#ef5350',
    } = {},
    asset,
}: TradeChartProps) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
    const lastCandleRef = useRef<CandlestickData | null>(null);

    const { assetMap } = useSocket()
    const currentAsset = assetMap.find(a => a.symbol === asset);
    const livePrice = currentAsset
        ? currentAsset.buy / Math.pow(10, currentAsset.decimal)
        : 0;

    // Get timeframe in milliseconds
    const getTimeframeMs = (period: string): number => {
        const timePeriod = allTimePeriods.find(tp => tp.value === period);
        return timePeriod ? timePeriod.ms : 60000; 
    };

    // Convert timestamp to UTCTimestamp
    const toUTCTimestamp = (timestamp: number): UTCTimestamp => {
        return Math.floor(timestamp / 1000) as UTCTimestamp;
    };

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
            tickMarkFormatter: (time: UTCTimestamp) => {
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
            if (data.length > 100) {
                const startIndex = Math.max(0, data.length - 100);
                const startTime = data[startIndex].time;
                const endTime = data[data.length - 1].time;
                
                chartRef.current.timeScale().setVisibleRange({
                    from: startTime,
                    to: endTime,
                });
            } else {
                chartRef.current.timeScale().fitContent();
            }
        }

        // Set last candle to the most recent historical candle
        lastCandleRef.current = data[data.length - 1] ?? null;

    }, [data]);

    // Handle live price updates
    useEffect(() => {
        if (!seriesRef.current || !livePrice || livePrice <= 0) return;
        if (!lastCandleRef.current) return; 

        const timeframeMs = getTimeframeMs(timePeriod);
        const now = Date.now();
        
        // Calculate current bucket timestamp based on timeframe
        const currentBucket = toUTCTimestamp(
            Math.floor(now / timeframeMs) * timeframeMs
        );

        // Only skip if current bucket is actually older
        if (currentBucket < (lastCandleRef.current.time as number)) {
            return;
        }

        if (lastCandleRef.current.time !== currentBucket) {
            // New candle - start a new timeframe period
            const newCandle: CandlestickData = {
                time: currentBucket,
                open: livePrice,
                high: livePrice,
                low: livePrice,
                close: livePrice,
            };
            lastCandleRef.current = newCandle;
            seriesRef.current.update(newCandle);
        } else {
            // Update existing candle within the same timeframe period
            const updatedCandle: CandlestickData = {
                ...lastCandleRef.current,
                close: livePrice,
                high: Math.max(lastCandleRef.current.high, livePrice),
                low: Math.min(lastCandleRef.current.low, livePrice),
            };
            lastCandleRef.current = updatedCandle;
            seriesRef.current.update(updatedCandle);
        }
    }, [livePrice, timePeriod, allTimePeriods]);

    // Reset last candle when time period changes
    useEffect(() => {
        lastCandleRef.current = null;
    }, [timePeriod]);

    return <div ref={chartContainerRef} style={{ width: '100%', height: '350px' }} />;
};

export default TradeChart;