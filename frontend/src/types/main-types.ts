export interface AssetData {
    timestamp: string
    asset: string 
    price: number
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
    asset: string
    type: "Buy" | "Sell"
    volume: number
    open_price: number 
    current_price: number 
}