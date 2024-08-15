const db = require('../db/index')

const bcrypt = require('bcryptjs')

// 用这个包来生成 Token 字符串
const jwt = require('jsonwebtoken')
const config = require('../config')


exports.toggleFollow = (req, res) => {
    const { follower_uid, followed_uid } = req.body;
    console.log(follower_uid, followed_uid)
    // 检查当前关注状态
    db.query(
    'SELECT status FROM follows WHERE follower_uid = ? AND followed_uid = ?',
    [follower_uid, followed_uid],
    (error, results) => {
        if (error) {
        console.error('查询关注状态失败:', error);
        return res.status(500).send('服务器错误');
        }

        if (results.length > 0) {
        // 已存在关注记录，切换关注状态
        const currentStatus = results[0].status;

        if (currentStatus === 0) {
            // 当前状态是关注，改为取消关注
            console.log('检测到关注',follower_uid,'关注了',followed_uid)
            db.query(
            'UPDATE follows SET status = 1 WHERE follower_uid = ? AND followed_uid = ?',
            [follower_uid, followed_uid],
            (updateError) => {
                if (updateError) {
                console.error('更新关注状态失败:', updateError);
                return res.status(500).send('服务器错误');
                }
                res.send('取消关注成功');
            }
            );
        } else {
            // 当前状态是取消关注，改为关注
            console.log('检测到未')
            db.query(
            'UPDATE follows SET status = 0 WHERE follower_uid = ? AND followed_uid = ?',
            [follower_uid, followed_uid],
            (updateError) => {
                if (updateError) {
                console.error('更新关注状态失败:', updateError);
                return res.status(500).send('服务器错误');
                }
                res.send('关注成功');
            }
            );
        }
        } else {
        // 没有关注记录，插入新的关注记录
        db.query(
            'INSERT INTO follows (follower_uid, followed_uid, status) VALUES (?, ?, 0)',
            [follower_uid, followed_uid],
            (insertError) => {
            if (insertError) {
                console.error('插入关注记录失败:', insertError);
                return res.status(500).send('服务器错误');
            }
            res.send('关注成功');
            }
        );
        }
    }
    );
};
