import express from 'express'
import { me, signup, login, logout } from '../controllers/authController.js'

const router = express.Router()

router.get('/me', me)
router.post('/signup', signup)
router.post('/login', login)
router.post('/logout', logout)

export default router
