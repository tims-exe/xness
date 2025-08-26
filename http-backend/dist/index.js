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
const express_1 = __importDefault(require("express"));
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
const pool = new pg_1.Pool({
    user: "postgres",
    host: "localhost",
    database: "xness",
    password: process.env.DB_PASSWORD,
    port: 5432,
});
// /api/trades/BTCUSDT/5
// TODO: zod validation
app.get("/api/trades/:asset/:time", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { asset, time } = req.params;
    console.log(`GET: /api/trades/${asset}/${time}`);
    const table = `trades_${time}`;
    try {
        const query = `SELECT * FROM ${table} WHERE asset = $1 ORDER BY timestamp ASC`;
        const { rows } = yield pool.query(query, [asset]);
        return res.json(rows);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "db query failed" });
    }
}));
app.listen(3000, () => {
    console.log("http backend running");
});
