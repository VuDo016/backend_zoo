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

const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params; // Lấy ID từ URL parameter

        const sql = `
        SELECT employer.*, membership_rank.rank_name, membership_rank.min_total_price, membership_rank.discount_percentage, 
        SUM(ticket_history.total_price) AS total_purchase_amount
        FROM employer
        JOIN membership_rank ON employer.membership_rank_id = membership_rank.id
        LEFT JOIN ticket_history ON employer.id = ticket_history.user_id
        WHERE employer.id = ?
      `;
        const [rows] = await req.pool.query(sql, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
        }

        const user = rows[0];
        const totalPurchaseAmount = user.total_purchase_amount || 0; // Nếu không có hóa đơn, tổng tiền mua sẽ là 0

        // Thêm thông tin tổng tiền mua vào đối tượng user
        user.total_purchase_amount = totalPurchaseAmount;

        res.json(user);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

const updatetUserById = async (req, res, next) => {
    try {
        const { id, first_name, name, gender, birth_date, address, phone, email, avatar_url } = req.body;

        const sql = 'UPDATE employer SET first_name = ?, name = ?, gender = ?, birth_date = ?, address = ?, phone = ?, email = ?, avatar_url = ? WHERE id = ?';
        const values = [first_name, name, gender, birth_date, address, phone, email, avatar_url, id];
        await req.pool.query(sql, values);

        res.json({ message: 'Update the user succeeds!' });
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

        const trimmedFullName = name.trim();

        const validateVietnameseFullName = (name) => {
            const words = name.split(" ");

            for (let i = 0; i < words.length; i++) {
                const word = words[i];

                // Kiểm tra số lượng ký tự trong từ
                if (word.length < 2) {
                    return false;
                }

                // Kiểm tra từng chữ trong từ
                for (let j = 0; j < word.length; j++) {
                    const character = word.charAt(j);

                    // Kiểm tra chữ cái đầu viết hoa
                    if (j === 0 && !/[\p{Lu}]/u.test(character)) {
                        return false;
                    }

                    // Kiểm tra chữ cái tiếp theo viết thường
                    if (j !== 0 && !/[\p{Ll}]/u.test(character)) {
                        return false;
                    }
                }
            }

            return true;
        };

        const nameRegex = /^([^\d\s!@#$%^&*()_+=\-[\]{}|\\:;"'<>,.?/~`])+(?:\s+[^\d\s!@#$%^&*()_+=\-[\]{}|\\:;"'<>,.?/~`]+)*$/;

        const isNameValid = validateVietnameseFullName(trimmedFullName) && nameRegex.test(trimmedFullName);

        if (!isNameValid) {
            return res.status(400).json({ message: "Tên không hợp lệ" });
        }

        const nameParts = trimmedFullName.split(/\s+/);
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO employer (email, password, first_name, name, membership_rank_id) VALUES (?, ?, ?, ?,1)';
        const values = [email, hashedPassword, nameParts[0], nameParts[nameParts.length - 1]];
        await req.pool.query(sql, values);
        next();
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

const createStaff = async (req, res, next) => {
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

        const trimmedFullName = name.trim();

        const validateVietnameseFullName = (name) => {
            const words = name.split(" ");

            for (let i = 0; i < words.length; i++) {
                const word = words[i];

                // Kiểm tra số lượng ký tự trong từ
                if (word.length < 2) {
                    return false;
                }

                // Kiểm tra từng chữ trong từ
                for (let j = 0; j < word.length; j++) {
                    const character = word.charAt(j);

                    // Kiểm tra chữ cái đầu viết hoa
                    if (j === 0 && !/[\p{Lu}]/u.test(character)) {
                        return false;
                    }

                    // Kiểm tra chữ cái tiếp theo viết thường
                    if (j !== 0 && !/[\p{Ll}]/u.test(character)) {
                        return false;
                    }
                }
            }

            return true;
        };

        const nameRegex = /^([^\d\s!@#$%^&*()_+=\-[\]{}|\\:;"'<>,.?/~`])+(?:\s+[^\d\s!@#$%^&*()_+=\-[\]{}|\\:;"'<>,.?/~`]+)*$/;

        const isNameValid = validateVietnameseFullName(trimmedFullName) && nameRegex.test(trimmedFullName);

        if (!isNameValid) {
            return res.status(400).json({ message: "Tên không hợp lệ" });
        }

        const nameParts = trimmedFullName.split(/\s+/);
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO employer (email, password, first_name, name, membership_rank_id, role) VALUES (?, ?, ?, ?,1,"STAFF")';
        const values = [email, hashedPassword, nameParts[0], nameParts[nameParts.length - 1]];
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
            expiresIn: '1m'
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

    const token = authHeader

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

const updatePassword = async (req, res) => {
    try {
        const { pass, newPass, idKH } = req.body;

        if (newPass === "") {
            return res.status(401).json({ message: "Vui lòng không được trống mật khẩu !!!!" });
        }

        // Kiểm tra mật khẩu có độ dài tối thiểu là 8 ký tự
        if (newPass.length < 8) {
            return res
                .status(400)
                .json({ message: "Mật khẩu mới phải có ít nhất 8 ký tự" });
        }

        // Kiểm tra mật khẩu cũ
        const sql = 'SELECT password FROM employer WHERE id = ?';
        const [rows] = await req.pool.query(sql, [idKH]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        const currentPassword = rows[0].password;
        const isPasswordMatch = await bcrypt.compare(pass, currentPassword);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Mật khẩu cũ không chính xác' });
        }

        // Cập nhật mật khẩu mới
        const hashedPassword = await bcrypt.hash(newPass, 10);
        const updateSql = 'UPDATE employer SET password = ? WHERE id = ?';
        await req.pool.query(updateSql, [hashedPassword, idKH]);

        res.status(200).json({ message: 'Cập nhật mật khẩu thành công' });
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

const updateMembershipRank = async (req, res, next) => {
    try {
        const { id } = req.params; // Lấy ID khách hàng từ URL parameter

        // Truy vấn để tính tổng tiền của tất cả các hóa đơn
        const sql = `
        SELECT SUM(total_price) AS totalSpent
        FROM ticket_history
        WHERE user_id = ?;
      `;
        const [rows] = await req.pool.query(sql, [id]);
        const totalSpent = rows[0].totalSpent;

        // Truy vấn để tìm thứ hạng tương ứng với tổng tiền đã chi
        const rankSql = `
        SELECT id, min_total_price
        FROM membership_rank
        WHERE min_total_price <= ?
        ORDER BY min_total_price DESC
        LIMIT 1;
      `;
        const [rankRows] = await req.pool.query(rankSql, [totalSpent]);
        const membershipRankId = rankRows[0].id;

        // Cập nhật thứ hạng cho khách hàng
        const updateSql = `
        UPDATE employer
        SET membership_rank_id = ?
        WHERE id = ?;
      `;
        await req.pool.query(updateSql, [membershipRankId, id]);

        res.json({ message: 'Cập nhật thứ hạng thành công' });
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

const getUserByRole = async (req, res, next) => {
    try {
        const { role } = req.params; // Lấy ID từ URL parameter

        const sql = `
        SELECT *
        FROM employer
        WHERE employer.role = ?
      `;
        const rows = await req.pool.query(sql, [role]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Dữ liệu bị rỗng' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

const searchEmployer = async (req, res, next) => {
    try {
        const { keyword } = req.query; // Lấy từ khóa tìm kiếm từ query parameter
        const { role } = req.params; // Lấy vai trò từ URL parameter

        let sql;
        let searchKeyword;
        if (role === 'STAFF') {
            sql = `
          SELECT *
          FROM employer
          WHERE employer.role = 'STAFF'
            AND (employer.first_name LIKE ? OR employer.name LIKE ? OR employer.email LIKE ? OR employer.phone LIKE ? OR employer.address LIKE ?)
        `;
            searchKeyword = `%${keyword}%`;
        } else if (role === 'USER') {
            sql = `
          SELECT *
          FROM employer
          WHERE employer.role = 'USER'
            AND (employer.first_name LIKE ? OR employer.name LIKE ? OR employer.email LIKE ? OR employer.phone LIKE ? OR employer.address LIKE ?)
        `;
            searchKeyword = `%${keyword}%`;
        } else {
            return res.status(400).json({ message: 'Vai trò không hợp lệ' });
        }

        const rows = await req.pool.query(sql, [
            searchKeyword,
            searchKeyword,
            searchKeyword,
            searchKeyword,
            searchKeyword,
        ]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
        }

        res.json(rows[0]);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
};

module.exports = {
    generateTokens, updateRefreshToken, verifyToken, updateMembershipRank, getUserByRole,
    getAllUser, createEmployer, getUserById, updatetUserById, updatePassword, createStaff, searchEmployer
};