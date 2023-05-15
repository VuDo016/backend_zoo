const express = require('express')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const bcrypt = require('bcrypt');
const router = express.Router();
const { generateTokens, updateRefreshToken, verifyToken, getAllUser, createEmployer } = require('../controllers/accountController');

router.post('/login', getAllUser, async (req, res) => {
	const { email, password } = req.body;
	if (email === "" || password === "") {
		res.status(401).json({ message: "Vui lòng nhập đủ tt !!!!" });
	}
	else {
		const users = req.user;

		for (const user of users) {
			if (user.email === email) {
				const isPasswordMatch = await bcrypt.compare(password, user.password);
				if (isPasswordMatch) {
					const user = req.user.find(user => user.email === email)
					if (!user) return res.sendStatus(401)

					const tokens = generateTokens(user)
					await updateRefreshToken(req, res, email, tokens.refreshToken)
					res.status(200).json({ message: "Đăng nhập thành công", tokens: tokens });
				}
			}
		}
		res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
	}
})

router.post('/register', createEmployer, (req, res) => {
	res.status(200).json({ message: "Tạo tài khoản thành công !" });
})

router.post('/token', getAllUser, async (req, res) => {
	const refreshToken = req.body.refreshToken
	if (!refreshToken) return res.sendStatus(401)

	const user = req.user.find(user => user.refreshToken === refreshToken)
	if (!user) return res.sendStatus(403)

	try {
		jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)

		const tokens = generateTokens(user)
		await updateRefreshToken(req, res, user.email, tokens.refreshToken)

		res.json(tokens)
	} catch (error) {
		console.log(error)
		res.sendStatus(403)
	}
})

router.delete('/logout', getAllUser, verifyToken, async (req, res) => {
	const user = req.user.find(user => user.id === req.userId)
	await updateRefreshToken(req, res, user.email, null)

	res.sendStatus(204)
})

module.exports = router;