import jwt, { JwtPayload } from 'jsonwebtoken'
import { Users } from '../consts.js'
import { NextFunction, Request, Response } from 'express'

const JWT_SECRET = process.env.JWT_SECRET!

interface MyJwtPayload extends JwtPayload {
    userId: string
}

export const authMiddleware = (req:Request, res:Response, next: NextFunction) => {
    const token = req.header('Authorization')

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "No token found"
        })
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as MyJwtPayload

        const userId = Users.find(u => u.id === decoded.userId)

        if (!userId) {
            res.json({
                success: false,
                message: "error validating user"
            })
            return
        }
        req.userId = userId.id
        next();

    } catch (error) {
        console.log(error)
        res.status(401).json({
            success: false,
            message: "token no valid"
        })
    }

}