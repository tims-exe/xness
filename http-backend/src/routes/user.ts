import express from 'express'

export const userRouter = express.Router()

userRouter.post('/signup')
userRouter.post('/signin')
userRouter.post('/signout')

userRouter.get('/balance', (req, res) => {
    
})