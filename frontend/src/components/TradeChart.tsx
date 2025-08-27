import Chart from "react-apexcharts";

export type Candle = {
    x: string | number | Date; 
    y: [number, number, number, number];
};


interface TradeChartProps {
    data: Candle[]
    asset: string  
    timePeriod : string

}

const TradeChart = ({ data, timePeriod }: TradeChartProps) => {
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
                animations: {
                    enabled: false
                }
            },
            // title: {
            //     // text: `${asset} Candlestick Chart (${TIME_PERIODS.find(p => p.value === selectedTimePeriod)?.label})`,
            //     text: `${asset}`,
            //     align: "left",
            // },
            xaxis: {
                type: "datetime",
                labels: {
                    format: timePeriod === '1m' || timePeriod === '5m' ? 'HH:mm' : 'dd MMM HH:mm'
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

export default TradeChart