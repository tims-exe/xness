import { AssetData, OpenTradesTypes, UserType } from "./types/main";

export const Assets: AssetData[] = [
    { symbol: "BTCUSDT", buy: 0, sell: 0, decimal: 0, status: "up" },
    { symbol: "SOLUSDT", buy: 0, sell: 0, decimal: 0, status: "up" },
    { symbol: "ETHUSDT", buy: 0, sell: 0, decimal: 0, status: "up" },
];


export let OpenTrades: OpenTradesTypes[] = []

export let openTradeId: number = 0