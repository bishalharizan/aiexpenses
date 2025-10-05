import { Router } from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { authRequired } from '../middleware/auth.js'
import { EXPENSE_CATEGORIES } from '../models/Expense.js'

const router = Router()
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

router.use(authRequired)

router.post('/suggest-category', async (req, res) => {
	try {
		const { title, notes } = req.body || {}
		if (!title) return res.status(400).json({ error: 'title required' })
		const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
		const prompt = `You are a classifier. Map the given expense title and optional notes to one of these exact categories: ${EXPENSE_CATEGORIES.join(', ')}. Respond with only the category.
Title: ${title}
Notes: ${notes || ''}`
		const result = await model.generateContent(prompt)
		const text = result?.response?.text()?.trim()?.toUpperCase()
		const category = EXPENSE_CATEGORIES.includes(text) ? text : 'OTHER'
		return res.json({ category, raw: text })
	} catch (e) {
		return res.status(500).json({ error: 'AI error' })
	}
})

export default router
