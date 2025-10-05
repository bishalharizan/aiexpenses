import request from 'supertest'
import mongoose from 'mongoose'
import app from '../src/app.js'
import dotenv from 'dotenv'

dotenv.config()

let token = ''

beforeAll(async () => {
	await mongoose.connect(process.env.MONGO_URI)
	const uname = `e_${Math.random().toString(36).slice(2,8)}`
	await request(app).post('/api/auth/register').send({ username: uname, email: `${uname}@x.com`, password: 'pass1234' })
	const login = await request(app).post('/api/auth/login').send({ username: uname, password: 'pass1234' })
	token = login.body.token
})

afterAll(async () => {
	await mongoose.connection.close()
})

function auth(req) { return req.set('Authorization', `Bearer ${token}`) }

test('create/list/update/delete expense', async () => {
	const bad = await auth(request(app).post('/api/expenses')).send({})
	expect(bad.status).toBe(400)
	const created = await auth(request(app).post('/api/expenses')).send({ title: 'Test', category: 'FOOD', amount: 10, taxPercent: 5 })
	expect(created.status).toBe(201)
	const id = created.body._id
	const list = await auth(request(app).get('/api/expenses'))
	expect(list.status).toBe(200)
	const updated = await auth(request(app).put(`/api/expenses/${id}`)).send({ amount: 12 })
	expect(updated.status).toBe(200)
	const del = await auth(request(app).delete(`/api/expenses/${id}`))
	expect(del.status).toBe(200)
})
