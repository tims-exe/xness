"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const redis_1 = require("redis");
const stream = "";
const url = `wss://stream.binance.com:9443/stream?streams=btcusdt@aggTrade`;
const ws = new ws_1.default(url);
const redis = (0, redis_1.createClient)({
    url: "redis://localhost:6379"
});
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        yield redis.connect();
        console.log("redis is connected");
    });
}
startServer().catch(console.error);
ws.on("open", () => {
    console.log("connected");
});
ws.onmessage = (event) => __awaiter(void 0, void 0, void 0, function* () {
    const data = event.data.toString();
    console.log(JSON.parse(data).data.E);
    // await redis.xAdd("trade_data", "*", {
    //     timestamp :"1756201379300",
    //     asset : "BTCUSDT", 
    //     price : "110104.52000000"
    // })
});
