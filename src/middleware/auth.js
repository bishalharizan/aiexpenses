import jwt from 'jsonwebtoken'

export function signToken(payload, opts = {}) {
	const secret = process.env.JWT_SECRET
	return jwt.sign(payload, secret, { expiresIn: '7d', ...opts })
}

export function authRequired(req, res, next) {
	const header = req.headers.authorization || ''
	const token = header.startsWith('Bearer ') ? header.slice(7) : null
	if (!token) return res.status(401).json({ error: 'Missing token' })
	try {
		const secret = process.env.JWT_SECRET
		const decoded = jwt.verify(token, secret)
		req.user = decoded
		return next()
	} catch (e) {
		return res.status(401).json({ error: 'Invalid or expired token' })
	}
}
