export interface AssetData {
    timestamp: string
    asset: string 
    price: number
}

export interface OpenTradesTypes {
    orderId: number 
    volume: number 
    margin: number
    openPrice: number
    asset: string
    type: string
}