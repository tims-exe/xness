// export interface AssetData {
//     timestamp: string
//     asset: string 
//     price: number
//     ask: number 
//     bid: number
// }
// export interface AssetData {
//     price: number
//     ask: number 
//     bid: number
// }


export interface AssetData {
    symbol: string 
    buy: number
    sell: number 
    decimal : number
    status: "up" | "down"
}


export interface TradeData {
    timestamp: string
    asset: string
    open_price: number
    close_price: number
    high_price: number
    low_price: number 
    volume: string
}

export interface ActiveTradeType {
    orderId: number
    asset: string
    type: "Buy" | "Sell"
    volume: number
    open_price: number 
    current_price: number
    pnl: number
    stopLoss: number | null 
    takeProfit: number | null
}


export interface ChartColors {
    backgroundColor?: string;
    textColor?: string;
    upColor?: string;
    downColor?: string;
    wickUpColor?: string;
    wickDownColor?: string;
}


export interface TimePeriod {
    value: string;
    label: string;
    ms: number
};