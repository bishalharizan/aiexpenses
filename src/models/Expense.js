import mongoose from 'mongoose'

// Enum: category
export const EXPENSE_CATEGORIES = ['FOOD', 'TRAVEL', 'UTILITIES', 'ENTERTAINMENT', 'OTHER']

const expenseSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
		title: { type: String, required: true, trim: true },
		category: { type: String, enum: EXPENSE_CATEGORIES, required: true },
		amount: { type: Number, required: true, min: 0 },
		taxPercent: { type: Number, required: true, min: 0, max: 100 },
		isRecurring: { type: Boolean, default: false },
		spentAt: { type: Date, default: Date.now }
	},
	{ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
)

// Calculated field: totalWithTax = amount + amount * taxPercent/100
expenseSchema.virtual('totalWithTax').get(function () {
	const amount = this.amount || 0
	const tax = (this.taxPercent || 0) / 100
	return Number((amount + amount * tax).toFixed(2))
})

export default mongoose.model('Expense', expenseSchema)
