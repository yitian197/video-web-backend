const db = require('../db/index')

exports.postbook = (req,res)=>{
    const bookinfo = {
        // 标题、内容、状态、所属的分类Id
        ...req.body
      }
      console.log(bookinfo)
    const sql = `insert into book set ?`
    db.query(sql, bookinfo, (err, results) => {
        // 执行 SQL 语句失败
        if (err) return res.cc(err)
        // 执行 SQL 语句成功，但是影响行数不等于 1
        if (results.affectedRows !== 1) return res.cc('发布物品失败！')
        // 发布文章成功
        //res.cc('发布物品成功', 0,results.insertId)
        res.send({
            status: 0,
            message: '发布物品成功!',
            bookId: results.insertId
        })
        console.log('发布成功')
      })
}