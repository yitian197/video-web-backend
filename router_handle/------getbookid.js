const db = require('../db/index')

exports.getbookid = (req,res)=>{
    const userinfo = req.body;
    const sql = 'select * from book LEFT JOIN bookimg ON book.bookId = bookimg.bookId where book.bookId = ?'
    console.log(userinfo.bookId )
    db.query(sql, userinfo.bookId , (err,results)=>{
        if (err) return res.cc(err)

        if (results.length == 0) return res.cc('获取信息失败！')
        console.log(results)
        res.send({
            status: 0,
            message: '获取信息成功',
            data: results
        })
    })
}