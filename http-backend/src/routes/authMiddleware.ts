import jwt from 'jsonwebtoken'
import { Users } from '../consts'

const JWT_SECRET = process.env.JWT_SECRET!

export const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "No token found"
        })
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET)

        const user = Users.find(u => u.id === decoded.userId)

        if (!user) {
            res.json
        }
    } catch (error) {
        console.log(error)
        res.status(401).json({
            success: false,
            message: "token no valid"
        })
    }

}