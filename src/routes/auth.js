import { Router } from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { signToken } from '../middleware/auth.js'

const router = Router()

router.post('/register', async (req, res) => {
	try {
		const { username, email, password } = req.body || {}
		if (!username || !email || !password) {
			return res.status(400).json({ error: 'username, email, password required' })
		}
		const existing = await User.findOne({ $or: [{ username }, { email }] })
		if (existing) return res.status(409).json({ error: 'User already exists' })
		const passwordHash = await bcrypt.hash(password, 10)
		const user = await User.create({ username, email, passwordHash })
		const token = signToken({ userId: user._id, username: user.username })
		return res.status(201).json({ token, user: { id: user._id, username, email } })
	} catch (e) {
		return res.status(500).json({ error: 'Server error' })
	}
})

router.post('/login', async (req, res) => {
	try {
		const { username, password } = req.body || {}
		if (!username || !password) return res.status(400).json({ error: 'username and password required' })
		const user = await User.findOne({ username })
		if (!user) return res.status(401).json({ error: 'Invalid credentials' })
		const ok = await bcrypt.compare(password, user.passwordHash)
		if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
		const token = signToken({ userId: user._id, username: user.username })
		return res.json({ token, user: { id: user._id, username: user.username, email: user.email } })
	} catch (e) {
		return res.status(500).json({ error: 'Server error' })
	}
})

export default router
