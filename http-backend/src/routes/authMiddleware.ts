import jwt, { JwtPayload } from 'jsonwebtoken'
import { NextFunction, Request, Response } from 'express'
import dotenv from 'dotenv'
import { pool } from '../config/db.js'   

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET!

interface MyJwtPayload extends JwtPayload {
    userId: string
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "No token found"
        })
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as MyJwtPayload

        const result = await pool.query(
            `SELECT id FROM users WHERE id = $1`,
            [decoded.userId]
        )

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "error validating user"
            })
        }

        req.userId = decoded.userId
        next()

    } catch (error) {
        console.error(error)
        return res.status(401).json({
            success: false,
            message: "token not valid"
        })
    }
}
