const db = require('../db/index')

const bcrypt = require('bcryptjs')

// 用这个包来生成 Token 字符串
const jwt = require('jsonwebtoken')
const config = require('../config')


exports.regUser = (req, res) => {
    const userinfo = req.body;
    
    // 校验
    if (!userinfo.username || !userinfo.password) {
        return res.send({ status: 1, message: '用户名密码不合法' });
    }
    
    // 定义 SQL 语句
    const sqlStr = 'SELECT * FROM users WHERE username=?';
    db.query(sqlStr, userinfo.username, (err, results) => {
        if (err) {
            return res.send({ status: 1, message: err.message });
        }

        if (results.length > 0) {
            return res.send({ status: 1, message: '用户名被占用' });
        }

        // 加密密码
        userinfo.password = bcrypt.hashSync(userinfo.password, 10);

        // 插入用户数据
        const sql = 'INSERT INTO users SET ?';
        db.query(sql, { username: userinfo.username, password: userinfo.password }, function (err, results) {
            if (err) {
                return res.send({ status: 1, message: err.message });
            }

            if (results.affectedRows !== 1) {
                return res.send({ status: 1, message: '注册用户失败，请稍后再试！' });
            }

            // 注册成功
            // 查询用户信息以确保 token 使用正确的数据
            db.query('SELECT * FROM users WHERE username = ?', userinfo.username, (err, results) => {
                if (err) {
                    return res.send({ status: 1, message: err.message });
                }

                // 剔除密码字段
                const user = { ...results[0], password: '', user_pic: '' };

                // 生成 token
                const tokenStr = jwt.sign(user, config.jwtSecretKey, { expiresIn: config.expiresIn });

                res.send({
                    status: 100,
                    message: '注册成功!',
                    token: tokenStr
                });
            });
        });
    });
};

exports.login = (req,res)=>{
    const userinfo = req.body

    const sql = `select * from users where username=?`

    db.query(sql, userinfo.username, function (err, results) {
        // 执行 SQL 语句失败
        if (err) return res.json(err)
        // 执行 SQL 语句成功，但是查询到数据条数不等于 1
        if (results.length !== 1) return res.send('登录失败！')
        // 判断用户输入的登录密码是否和数据库中的密码一致

        const compareResult = bcrypt.compareSync(userinfo.password, results[0].password)

        // 如果对比的结果等于 false, 则证明用户输入的密码错误
        if (!compareResult) {
            return res.send('密码错误，登录失败！')
        }
        console.log(results[0])
        // 剔除完毕之后，user 中只保留了用户的 id, username, nickname, email 这四个属性的值
        const user = { ...results[0], password: '', user_pic: '' }

        const tokenStr = jwt.sign(user,config.jwtSecretKey,{expiresIn: config.expiresIn})

        res.send({
            status: 100,
            message: '登录成功!',
            token: tokenStr
        })
    })
}