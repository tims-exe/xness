import express from 'express'
import { authMiddleware } from './authMiddleware.js'
import { Users } from '../consts.js'
import { v4 as uuidv4 } from "uuid";
import jwt from 'jsonwebtoken'

export const userRouter = express.Router()

const JWT_SECRET = process.env.JWT_SECRET!

userRouter.post('/signup', (req, res) => {
    const { email, password } = req.body
    console.log(`POST: /api/v1/user/signup/`)

    if (!email || !password) {
        return res.status(403).json({
            success: false,
            message: "provide email and password"
        })
    }

    let newId: string 
    do {
        newId = uuidv4();
    } while (Users.some(u => u.id === newId))

    Users.push({ 
        id: newId,
        email: email,
        password: password,
        balances: {
            "USD" : 5000
        },
        usedMargin: 0
    })

    console.log(Users)

    return res.status(200).json({
        sucess: true,
        userId: newId
    })
})



userRouter.post('/signin', (req, res) => {
    const { email, password } = req.body;
    console.log(`POST: /api/v1/user/signin/`)

    if (!email || !password) {
        console.log('provide email and password')
        return res.status(400).json({
            success: false,
            message: 'provide email and password'
        });
    }

    const user = Users.find(u => u.email === email && u.password === password);

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "invalid credentials"
        });
    }

    const token = jwt.sign({
        userId : user.id
    }, JWT_SECRET)

    return res.status(200).json({
        success: true,
        token: token
    })

})


userRouter.get('/balance', authMiddleware, (req, res) => {
    const userId = req.params.id
    console.log(`GET: /api/v1/user/balance/`)

    const user = Users.find(u => u.id === userId);

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    res.json({ balance: user.balances.USD });
})