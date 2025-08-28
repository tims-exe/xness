export interface AssetData {
    timestamp: string
    asset: string 
    price: number
}

export interface OpenTradesTypes {
    userId: number
    orderId: number 
    volume: number 
    margin: number
    openPrice: number
    asset: string
    type: string
    pnl: number
}