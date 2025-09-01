export interface AssetData {
    symbol: string 
    buy: number
    sell: number 
    decimal : number
    status: "up" | "down"
}


export interface IncomingAssetData {
    timestamp: string,
    asset: string,
    price: number,
    buy: number,
    sell: number,
    decimal: number
}

export interface OpenTradesTypes {
    userId: string
    orderId: number 
    volume: number 
    margin: number
    openPrice: number
    asset: string
    type: string
    pnl: number
    stopLoss: number | null
    takeProfit: number | null
}


export interface UserType {
    id: string,
    email: string,
    password: string,
    balance: number
    usedMargin: number
}