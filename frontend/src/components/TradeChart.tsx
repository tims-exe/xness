import React, { useEffect, useRef } from 'react';
import { 
    createChart, 
    ColorType,
    type IChartApi, 
    type ISeriesApi, 
    type CandlestickData, 
    CandlestickSeries
} from 'lightweight-charts';

interface ChartColors {
    backgroundColor?: string;
    textColor?: string;
    upColor?: string;
    downColor?: string;
    wickUpColor?: string;
    wickDownColor?: string;
}

interface TradeChartProps {
    data: CandlestickData[];
    asset: string;
    timePeriod: string;
    colors?: ChartColors;
}

const TradeChart = ({ 
    data, 
    colors: {
        backgroundColor = '#ffffff',
        textColor = '#333',
        upColor = '#26a69a',
        downColor = '#ef5350',
        wickUpColor = '#26a69a',
        wickDownColor = '#ef5350',
    } = {}
}: TradeChartProps) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

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

        // Handle window resize
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

    useEffect(() => {
        if (!seriesRef.current || !data || data.length === 0) return;

        seriesRef.current.setData(data);
        
        if (chartRef.current) {
            chartRef.current.timeScale().fitContent();
        }
    }, [data]);

    return <div ref={chartContainerRef} style={{ width: '100%', height: '350px' }} />;
};

export default TradeChart;