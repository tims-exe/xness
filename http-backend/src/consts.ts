import { OpenTradesTypes } from "./types";

export const Users = [
    {
        id: 1,
        username: "abcde",
        password: "123",
        balances: {
            "USD": 10000
        },
        usedMargin: 0
    }
];


export const Assets: Record<string, Record<string, number>> = {
    "BTCUSDT" : {
        price: 0, 
        ask: 0, 
        bid: 0
    },
    "SOLUSDT" : {
        price: 0, 
        ask: 0, 
        bid: 0
    },
    "ETHUSDT" : {
        price: 0, 
        ask: 0, 
        bid: 0
    }
} 

export let OpenTrades: OpenTradesTypes[] = []