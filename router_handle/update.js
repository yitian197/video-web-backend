const db = require('../db/index')
const bcrypt = require('bcryptjs')


// 用这个包来生成 Token 字符串
const jwt = require('jsonwebtoken')
const config = require('../config')

exports.uploadAvatar = (req, res) => {
    // 获取用户的 ID
    const uid = req.user.uid;

    // 检查 req.file 是否存在
    if (!req.file) {
        return res.status(400).json({ error: '请上传文件' });
    }

    // 获取文件名
    const filename = req.file.filename;
    const fileUrl = `http://localhost:5050/upload/${filename}`;

    // SQL 查询，更新用户头像地址
    const sql = 'UPDATE users SET avatar_url = ? WHERE uid = ?';

    // 执行 SQL 查询
    db.query(sql, [fileUrl, uid], (err, results) => {
        if (err) {
            console.error('数据库操作失败', err);
            return res.status(500).json({ error: '更新用户头像失败' });
        }

        // 检查是否有行受到影响
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: '用户未找到' });
        }

        // 返回成功响应
        res.status(200).json({
            status: 200,
            message: '头像更新成功',
            fileUrl: fileUrl//req.file
        });
    });
};

exports.updateUser = (req, res) => {
    console.log('收到请求', req.body,req.user);

    const { username, description , gender } = req.body;
    const {uid} = req.user;
    console.log('uid为',uid)
    if (!uid) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    // Define the SQL query to update user information
    const sql = 'UPDATE users SET username = ?, description = ? ,gender = ? WHERE uid = ?';

    // Execute the SQL query
    db.query(sql, [username, description, gender ,uid], (err, results) => {
        if (err) {
            console.error('数据库操作失败', err);
            return res.status(500).json({ error: '更新用户信息失败' });
        }

        // Check if any rows were affected
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: '用户未找到' });
        }

        // Return a success response
        res.status(200).json({ 
            status: 200,
            message: '用户信息更新成功',
        });
    });
};