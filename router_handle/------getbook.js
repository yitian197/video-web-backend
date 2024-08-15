const db = require('../db/index')

exports.getbook = (req,res)=>{
    const userinfo = req.body;
    const sql = 'select * from book LEFT JOIN bookimg ON book.bookId = bookimg.bookId '
    console.log(userinfo.id)
    db.query(sql, userinfo.id , (err,results)=>{
        if (err) return res.cc(err)

        if (results.length == 0) return res.cc('获取信息失败！')
        res.send({
            status: 0,
            message: '获取信息成功',
            data: results
        })
    })
}