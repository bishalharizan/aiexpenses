import { Router } from 'express'
import Expense, { EXPENSE_CATEGORIES } from '../models/Expense.js'
import { authRequired } from '../middleware/auth.js'

const router = Router()

router.use(authRequired)

// Create
router.post('/', async (req, res) => {
	try {
		const { title, category, amount, taxPercent, isRecurring, spentAt } = req.body || {}
		if (!title || !category || amount == null || taxPercent == null) {
			return res.status(400).json({ error: 'title, category, amount, taxPercent required' })
		}
		if (!EXPENSE_CATEGORIES.includes(category)) {
			return res.status(400).json({ error: 'Invalid category' })
		}
		const doc = await Expense.create({
			userId: req.user.userId,
			title,
			category,
			amount,
			taxPercent,
			isRecurring: !!isRecurring,
			spentAt: spentAt ? new Date(spentAt) : undefined
		})
		return res.status(201).json(doc)
	} catch (e) {
		return res.status(500).json({ error: 'Server error' })
	}
})

// List with pagination, filter, sort, search
router.get('/', async (req, res) => {
	try {
		const page = Math.max(1, parseInt(req.query.page) || 1)
		const limit = Math.min(50, parseInt(req.query.limit) || 10)
		const skip = (page - 1) * limit

		const filter = { userId: req.user.userId }
		if (req.query.category && EXPENSE_CATEGORIES.includes(req.query.category)) {
			filter.category = req.query.category
		}
		if (req.query.search) {
			filter.title = { $regex: String(req.query.search), $options: 'i' }
		}
		if (req.query.recurring === 'true') filter.isRecurring = true
		if (req.query.recurring === 'false') filter.isRecurring = false

		// Sorting
		const sortField = ['createdAt', 'amount', 'spentAt', 'title'].includes(req.query.sortBy) ? req.query.sortBy : 'createdAt'
		const sortDir = req.query.sortDir === 'asc' ? 1 : -1
		const sort = { [sortField]: sortDir }

		const [items, total] = await Promise.all([
			Expense.find(filter).sort(sort).skip(skip).limit(limit),
			Expense.countDocuments(filter)
		])

		return res.json({ items, total, page, totalPages: Math.ceil(total / limit) })
	} catch (e) {
		return res.status(500).json({ error: 'Server error' })
	}
})

// Read one
router.get('/:id', async (req, res) => {
	try {
		const item = await Expense.findOne({ _id: req.params.id, userId: req.user.userId })
		if (!item) return res.status(404).json({ error: 'Not found' })
		return res.json(item)
	} catch (e) {
		return res.status(500).json({ error: 'Server error' })
	}
})

// Update
router.put('/:id', async (req, res) => {
	try {
		const updates = {}
		const allowed = ['title', 'category', 'amount', 'taxPercent', 'isRecurring', 'spentAt']
		for (const k of allowed) if (k in req.body) updates[k] = req.body[k]
		if (updates.category && !EXPENSE_CATEGORIES.includes(updates.category)) {
			return res.status(400).json({ error: 'Invalid category' })
		}
		const item = await Expense.findOneAndUpdate(
			{ _id: req.params.id, userId: req.user.userId },
			updates,
			{ new: true }
		)
		if (!item) return res.status(404).json({ error: 'Not found' })
		return res.json(item)
	} catch (e) {
		return res.status(500).json({ error: 'Server error' })
	}
})

// Delete
router.delete('/:id', async (req, res) => {
	try {
		const item = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.userId })
		if (!item) return res.status(404).json({ error: 'Not found' })
		return res.json({ ok: true })
	} catch (e) {
		return res.status(500).json({ error: 'Server error' })
	}
})

export default router
