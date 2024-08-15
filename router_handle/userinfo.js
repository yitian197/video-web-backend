const db = require('../db/index')

exports.getUserInfo = (req,res)=>{
    console.log(req.user)

    const sql = `
        SELECT
            u.uid,
            u.username,
            u.email,
            u.coins,
            u.avatar_url,
            gender,
            description,
            COALESCE(follow_counts.following_count, 0) AS following_count,
            COALESCE(follower_counts.follower_count, 0) AS follower_count
        FROM users u
        LEFT JOIN (
            SELECT follower_uid, COUNT(*) AS following_count
            FROM follows
            WHERE status = 0
            GROUP BY follower_uid
        ) follow_counts ON u.uid = follow_counts.follower_uid
        LEFT JOIN (
            SELECT followed_uid, COUNT(*) AS follower_count
            FROM follows
            WHERE status = 0
            GROUP BY followed_uid
        ) follower_counts ON u.uid = follower_counts.followed_uid
        WHERE u.uid = ?
    `

    db.query(sql, req.user.uid , (err,results)=>{
        if (err) return res.send(err)

        if (results.length!== 1) return res.send('获取用户信息失败！')

        res.send({
            status: 200,
            message: '获取信息成功',
            data: results[0]
        })
    })
}

exports.getOneUserInfo = (req,res)=>{
    console.log('收到请求')
    const sql = `
        SELECT
            u.uid,
            u.username,
            u.email,
            u.coins,
            u.avatar_url,
            gender,
            description,
            COALESCE(follow_counts.following_count, 0) AS following_count,
            COALESCE(follower_counts.follower_count, 0) AS follower_count
        FROM users u
        LEFT JOIN (
            SELECT follower_uid, COUNT(*) AS following_count
            FROM follows
            WHERE status = 0
            GROUP BY follower_uid
        ) follow_counts ON u.uid = follow_counts.follower_uid
        LEFT JOIN (
            SELECT followed_uid, COUNT(*) AS follower_count
            FROM follows
            WHERE status = 0
            GROUP BY followed_uid
        ) follower_counts ON u.uid = follower_counts.followed_uid
        WHERE u.uid = ?
    `

    db.query(sql, req.query.uid , (err,results)=>{
        if (err) return res.send(err)

        if (results.length!== 1) return res.send('获取用户信息失败！')

        res.send({
            status: 200,
            message: '获取信息成功',
            data: results[0]
        })
    })
}