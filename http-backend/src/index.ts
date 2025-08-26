import express from 'express';
import { Pool } from 'pg'; 
import dotenv from 'dotenv'
import cors from 'cors';

dotenv.config()

const app = express()
app.use(cors())

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "xness",
    password: process.env.DB_PASSWORD,
    port: 5432,
})


// /api/trades/BTCUSDT/5

// TODO: zod validation
app.get("/api/trades/:asset/:time", async (req, res) => {
    
    const {asset, time} = req.params;

    console.log(`GET: /api/trades/${asset}/${time}`)
    
    const table = `trades_${time}`

    try {
        const query = `SELECT * FROM ${table} WHERE asset = $1 ORDER BY timestamp ASC`;
        const { rows } = await pool.query(query, [asset]);
        return res.json(rows)
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "db query failed" });
    }
})

app.listen(3000 , () => {
    console.log("http backend running")
})