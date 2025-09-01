import express from 'express'
import { authMiddleware } from './authMiddleware.js'
import { v4 as uuidv4 } from "uuid";
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { pool } from '../config/db.js';
dotenv.config()

export const userRouter = express.Router()


userRouter.post('/signup', async (req, res) => {
    const { email, password } = req.body
    console.log(`POST: /api/v1/user/signup/`)

    if (!email || !password) {
        return res.status(403).json({
            success: false,
            message: "provide email and password"
        })
    }
    try {
        const result = await pool.query(
            `INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email, balance, used_margin`
        , [email, password])
        return res.json({
            success: true,
            userId: result.rows[0].id
        })
    } catch (error) {
        console.log(error)
    }

    return res.json({
        success: false,
        message: "error"
    })
})



userRouter.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    console.log(`POST: /api/v1/user/signin/`)

    const JWT_SECRET = process.env.JWT_SECRET!

    if (!email || !password) {
        console.log('provide email and password')
        return res.status(400).json({
            success: false,
            message: 'provide email and password'
        });
    }

    const result = await pool.query(
        `SELECT * FROM users WHERE email = $1 AND password = $2`
    , [email, password])

    if (result.rows.length === 0) {
        return res.status(401).json({
            success: false,
            message: "invalid credentials"
        })
    }

    const user = result.rows[0]

    const token = jwt.sign({
        userId : user.id
    }, JWT_SECRET)

    return res.status(200).json({
        success: true,
        token: token
    })

})


userRouter.get('/balance', authMiddleware, async (req, res) => {
    const userId = req.userId
    console.log(`GET: /api/v1/user/balance/`)

    const result = await pool.query(
        `SELECT * FROM users WHERE id = $1`
    , [userId])

    if (result.rows.length === 0) {
        return res.status(401).json({
            success: false,
            message: "invalid credentials"
        })
    }

    const user = result.rows[0]

    res.json({ balance: user.balance });
})


userRouter.get('/verify', authMiddleware, (req, res) => {
    console.log(`GET: /api/v1/user/verify/`)

    return res.json({
        success: true,
        message: "verification successful"
    })
})
