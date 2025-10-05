import dotenv from 'dotenv'
import mongoose from 'mongoose'
import app from './app.js'

dotenv.config()

const port = process.env.PORT || 4000
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_expenses'

async function start() {
	try {
		await mongoose.connect(mongoUri)
		app.listen(port, () => {
			console.log(`API listening on http://localhost:${port}`)
		})
	} catch (err) {
		console.error('Failed to start server', err)
		process.exit(1)
	}
}

start()
