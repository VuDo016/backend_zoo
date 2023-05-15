const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
require('dotenv').config()

const getAllUser = async (req, res, next) => {
    try {
        const sql = 'SELECT * FROM employer';
        const [rows] = await req.pool.query(sql);
        req.user = rows
        next()
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

const createEmployer = async (req, res, next) => {
    try {
        const { email, password, name } = req.body;

        if (email === "" || password === "" || name === "") {
            return res.status(401).json({ message: "Vui lòng nhập đủ tt !!!!" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Email không hợp lệ" });
        }

        // Kiểm tra mật khẩu có độ dài tối thiểu là 8 ký tự
        if (password.length < 8) {
            return res
                .status(400)
                .json({ message: "Mật khẩu phải có ít nhất 8 ký tự" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO employer (email, password, name) VALUES (?, ?, ?)';
        const values = [email, hashedPassword, name];
        await req.pool.query(sql, values);
        next();
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};



const generateTokens = payload => {
    const { id, email } = payload

    // Create JWT
    const accessToken = jwt.sign(
        { id, email },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: '5m'
        }
    )

    const refreshToken = jwt.sign(
        { id, email },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: '1h'
        }
    )

    return { accessToken, refreshToken }
};

const updateRefreshToken = async (req, res, email, refreshToken) => {
    try {
        const sql = 'UPDATE employer SET refreshToken = ? WHERE email = ?';
        const [rows] = await req.pool.query(sql, [refreshToken, email]);

        if (rows.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

const verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization')
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) return res.sendStatus(401)

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        req.userId = decoded.id
        next()
    } catch (error) {
        console.log(error)
        return res.sendStatus(403)
    }
}

module.exports = { generateTokens, updateRefreshToken, verifyToken, getAllUser, createEmployer };