const db = require('../db/index')
const jwt = require('jsonwebtoken')
const config = require('../config')

exports.getRandomVideos = (req, res) => {
    const sql = `
        SELECT v.vid, u.username AS author, v.title, v.cover_url, v.video_url, v.upload_date
        FROM video v
        JOIN users u ON v.uid = u.uid
        ORDER BY RAND()
        LIMIT 11
    `;

    db.query(sql, (err, results) => {
        if (err) return res.send(err);

        if (results.length === 0) return res.send('获取信息失败！');

        res.send({
            status: 0,
            message: '获取信息成功',
            data: results
        });
    });
}

exports.getvideosDetail = (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // 获取 token，假设格式为 "Bearer token"
    let followerUid = null;

    if (token) {
        jwt.verify(token, config.jwtSecretKey, (err, decoded) => {
            if (err) {
                followerUid = null;
            } else {
                followerUid = decoded.uid;
            }
        });
    } else {
        followerUid = null;
    }

    const vid = req.query.vid;

    const videoSql = `
        SELECT
            v.*,
            sc.mc_name AS mcName,
            sc.sc_name AS scName
        FROM
            video v
        JOIN
            category sc ON v.sc_id = sc.sc_id
        WHERE
            v.vid = ?;
    `;

    const userSql = `
        SELECT
            u.uid,
            u.username,
            u.email,
            u.coins,
            u.avatar_url,
            u.gender,
            u.description,
            COALESCE(f.status, 1) AS isFollowing,
            COALESCE(fc.follower_count, 0) AS follower_count
        FROM users u
        LEFT JOIN follows f
            ON u.uid = f.followed_uid AND f.follower_uid = ?
        LEFT JOIN (
            SELECT followed_uid, COUNT(*) AS follower_count
            FROM follows
            WHERE status = 0
            GROUP BY followed_uid
        ) fc
            ON u.uid = fc.followed_uid
        WHERE u.uid = ?
    `;

    // Execute the first query to get video details
    db.query(videoSql,vid, (err, videoResults) => {
        if (err) return res.send(err);

        if (videoResults.length === 0) return res.send('获取信息失败！');

        // Extract the user ID from the video result
        const userId = videoResults[0].uid;

        // Execute the second query to get user details
        db.query(userSql,  [followerUid, userId], (err, userResults) => {
            if (err) return res.send(err);
            


            // Combine results
            res.send({
                status: 0,
                message: '获取信息成功',
                data: {
                    video: videoResults[0],
                    user: userResults[0] // Assuming there's only one user for the given video
                }
            });
        });
    });
}

function htmlEncode (str) {
    return str ? str.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2f;') : '';
}


exports.getDanmu = (req, res) => {
    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ error: 'vid is required' });
    }
    const sql = 'SELECT * FROM danmu WHERE vid = ? ORDER BY time';
    db.query(sql, id, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.send({
            code:0,
            data: results.map((item) => [item.time || 0, item.type || 0, item.color || 16777215, htmlEncode(item.author) , htmlEncode(item.text) || ''])
        })
    });
}

exports.postDanmu = (req, res) => {
    console.log(req.body)
    const { id, text, time, color, type, author, token } = req.body;
    if (!id) {
        return res.status(400).json({ error: 'id is required' });
    }
    const sql = 'INSERT INTO danmu (vid,text, time, color, type, author, token) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [id ,text, time, color, type, author, token], (err, results) => {
        if (err) {
            console.log(err.message)
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: results.insertId });
    });
}