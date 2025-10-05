import request from 'supertest'
import mongoose from 'mongoose'
import app from '../src/app.js'
import dotenv from 'dotenv'

dotenv.config()

beforeAll(async () => {
	await mongoose.connect(process.env.MONGO_URI)
})

afterAll(async () => {
	await mongoose.connection.close()
})

const uname = `u_${Math.random().toString(36).slice(2,8)}`

test('register -> login', async () => {
	const reg = await request(app).post('/api/auth/register').send({ username: uname, email: `${uname}@x.com`, password: 'pass1234' })
	expect(reg.status).toBe(201)
	const login = await request(app).post('/api/auth/login').send({ username: uname, password: 'pass1234' })
	expect(login.status).toBe(200)
	expect(login.body.token).toBeTruthy()
})
