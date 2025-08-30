import { AssetData, OpenTradesTypes, UserType } from "./types/main";

export const Users: UserType[] = [
    {
        id: "1",
        email: "test@gmail.com",
        password: "test123",
        balances: {
            "USD": 5000
        },
        usedMargin: 0
    }
];



export const Assets: AssetData[] = [
    { symbol: "BTCUSDT", buy: 0, sell: 0, decimal: 0, status: "up" },
    { symbol: "SOLUSDT", buy: 0, sell: 0, decimal: 0, status: "up" },
    { symbol: "ETHUSDT", buy: 0, sell: 0, decimal: 0, status: "up" },
];


// export const Assets: Record<string, Record<string, number>> = {
//     "BTCUSDT" : {
//         price: 0, 
//         ask: 0, 
//         bid: 0
//     },
//     "SOLUSDT" : {
//         price: 0, 
//         ask: 0, 
//         bid: 0
//     },
//     "ETHUSDT" : {
//         price: 0, 
//         ask: 0, 
//         bid: 0
//     }
// } 



export let OpenTrades: OpenTradesTypes[] = []

export let openTradeId: number = 0