const db = require('../db/index');
const jwt = require('jsonwebtoken')
const config = require('../config')

exports.SearchUser = (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // 获取 token，假设格式为 "Bearer token"

    let followerUid = null;

    if (token) {
        // 解密 token
        jwt.verify(token, config.jwtSecretKey, (err, decoded) => {
            if (err) {
                console.error('Token 验证失败:', err);
                // Token 验证失败，继续使用 followerUid 为 null
                performSearch(null);
            } else {
                // Token 验证成功，获取用户 ID
                followerUid = decoded.uid;
                performSearch(followerUid);
            }
        });
    } else {
        // 如果没有 token，继续使用 followerUid 为 null
        performSearch(null);
    }

    function performSearch(followerUid) {
        const keyword = req.query.keyword; // 获取 URL 查询参数中的 keyword

        if (!keyword) {
            return res.status(400).json({ status: 400, message: '用户名称未提供' });
        }

        // SQL 查询
        const sql = `
        SELECT u.uid, u.username, u.avatar_url,
            COALESCE(f.status, 1) AS isFollowing,
            COALESCE(fc.follower_count, 0) AS follower_count
        FROM users u
        LEFT JOIN follows f
            ON u.uid = f.followed_uid AND f.follower_uid = ?
        LEFT JOIN (
            SELECT followed_uid, COUNT(*) AS follower_count
            FROM follows
            WHERE status = 0  -- 只计算关注状态为 0 的记录
            GROUP BY followed_uid
        ) fc
            ON u.uid = fc.followed_uid
        WHERE u.username LIKE ?
        `;

        const values = [`%${keyword}%`]; // 使用通配符进行模糊匹配

        db.query(sql, [followerUid, `%${keyword}%`], (error, results) => {
            if (error) {
                console.error('查询错误:', error);
                return res.status(500).json({ status: 500, message: '数据库查询失败' });
            }

            if (results.length === 0) {
                return res.status(200).json({ status: 404, message: '未找到用户' });
            }

            // 返回搜索结果
            res.json({
                status: 100,
                message: '获取用户成功',
                data: results
            });
        });
    }
};

exports.SearchVideo = (req, res) => {
    const keyword = req.query.keyword; // 获取 URL 查询参数中的 keyword

    if (!keyword) {
        return res.status(400).json({ status: 400, message: '视频名字未提供' });
    }

    // SQL 查询
    const sql = 'SELECT video_name , upload_time , likes , views ,comments ,author FROM videos WHERE video_name LIKE ?';
    const values = [`%${keyword}%`]; // 使用通配符进行模糊匹配

    db.query(sql, values, (err, results) => {
        if (err) {
            console.error('查询错误:', err);
            return res.status(500).json({ status: 500, message: '数据库查询失败' });
        }

        if (results.length === 0) {
            return res.status(200).json({ status: 404, message: '无相关视频' });
        }

        // 返回搜索结果
        res.json({
            status: 100,
            message: '搜索视频成功',
            data: results
        });
    });
};
