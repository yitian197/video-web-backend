const db = require('../db/index')
// const bcrypt = require('bcryptjs')
const path = require('path');
const fs = require('fs');

// 用这个包来生成 Token 字符串
// const jwt = require('jsonwebtoken')
// const config = require('../config')

exports.uploadVideo = (req, res) => {
    // 获取用户的 ID
    // const uid = req.user.uid;

    // 检查 req.file 是否存在
    
    if (!req.file) {
        return res.status(400).json({ error: '请上传文件' });
    }
    const ext = path.extname(req.file.originalname)
    if(req.body.chunk == req.body.totalChunks - 1){
        console.log('所有分块上传成功，整合分块')
        mergeChunks(req.body.fileMd5,req.body.totalChunks,ext)
        res.send({
            status: 250,
            message: '所有分块上传成功', 
            videoUrl:`http://127.0.0.1:5050/upload/videos/${req.body.fileMd5}${ext}`
        })
    }else {
        res.send({
            status: 200,
            message: '分块上传成功',
        });
    }
};
// 整合文件
const mergeChunks = (fileMd5, totalChunks ,ext) => {
    const CHUNK_DIR = path.join(__dirname, '..', 'public', 'upload', 'videos' , fileMd5);
    const FINAL_DIR = path.join(__dirname, '..', 'public', 'upload', 'videos');
    const outputPath = path.join(FINAL_DIR, `${fileMd5}${ext}`);
    const writeStream = fs.createWriteStream(outputPath);


    writeStream.on('finish', () => {
        console.log('文件合并完成');
        // 删除整个分块文件夹
        fs.rm(CHUNK_DIR, { recursive: true, force: true }, (err) => {
            if (err) {
                console.error('删除分块文件夹时出错:', err);
            } else {
                console.log('分块文件夹已删除');
            }
        });
    });

    writeStream.on('error', (err) => {
        console.error('写入文件时出错:', err);
    });

    // 合并分块
    const mergeChunk = (index) => {
        if (index >= totalChunks) {
            writeStream.end();
            return;
        }

        const chunkPath = path.join(CHUNK_DIR, `${fileMd5}-${index}`);
        if (fs.existsSync(chunkPath)) {
            const chunkStream = fs.createReadStream(chunkPath);
            chunkStream.pipe(writeStream, { end: false });
            chunkStream.on('end', () => {
                mergeChunk(index + 1);
            });
            chunkStream.on('error', (err) => {
                console.error(`读取分块 ${chunkPath} 时出错:`, err);
                mergeChunk(index + 1);
            });
        } else {
            console.error(`分块文件 ${chunkPath} 不存在`);
            mergeChunk(index + 1);
        }
    };

    mergeChunk(0);
};


// 获取当前上传的分块索引
const getCurrentChunkIndex = (fileMd5) => {
    const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'upload', 'videos');
    return new Promise((resolve, reject) => {
        const folderPath = path.join(UPLOAD_DIR, fileMd5);
        
        // 检查文件夹是否存在
        if (!fs.existsSync(folderPath)) {
            return resolve(0); // 文件夹不存在，则返回索引 0
        }

        // 查询已上传的分块
        fs.readdir(folderPath, (err, files) => {
            if (err) {
                return reject(err);
            }

            // 提取分块编号
            const chunkIndices = files
                .filter(file => file.startsWith(`${fileMd5}-`) && !isNaN(parseInt(file.split('-')[1], 10)))
                .map(file => parseInt(file.split('-')[1], 10));

            // 如果有分块文件，返回最大分块编号 + 1，否则返回 0
            const currentIndex = chunkIndices.length > 0 ? Math.max(...chunkIndices) + 1 : 0;
            resolve(currentIndex);
        });
    });
};

// 处理请求并发送当前分块索引到前端
exports.getUploadStatus = async (req, res) => {
    const { fileMd5 } = req.body;

    if (!fileMd5) {
        return res.status(400).json({ error: '缺少 fileMd5 参数' });
    }

    try {
        const currentIndex = await getCurrentChunkIndex(fileMd5);
        res.json({
            status: 'success',
            data: {
                fileMd5,
                currentIndex
            }
        });
    } catch (error) {
        console.error('获取上传状态时出错:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
};

const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'upload', 'videos');

// 检查文件是否存在的函数
const checkFileExists = (fileName) => {
  return new Promise((resolve, reject) => {
    fs.readdir(UPLOAD_DIR, (err, files) => {
      if (err) {
        return reject(err); // 如果读取目录出错
      }
      
      // 检查文件是否存在
      const fileExists = files.includes(fileName);
      resolve(fileExists);
    });
  });
};

exports.addVideo = (req, res) => {
    // 获取请求体中的数据
    if (!req.file) {
        return res.status(400).json({ error: '请上传文件' });
    }

    // 获取文件名
    const filename = req.file.filename;
    const cover = `http://localhost:5050/upload/cover/${filename}`;

    const { title, type, auth, duration, mcid, scid, tags, descr, videoUrl} = req.body;

    const uid = req.user.uid;
    console.log(descr)
    const sql = `
        INSERT INTO video (uid, title, type, auth, duration, mc_id, sc_id, tags, descr, cover_url , video_url, status, upload_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
        uid,
        title,
        type,
        auth,
        duration,
        mcid,
        scid,
        tags,
        descr,
        cover,
        videoUrl,
        0, // status 默认为 0
        new Date() // upload_date 为当前日期
    ];

    db.query(sql, values, (error, results) => {
        if (error) {
            console.error('数据库操作失败:', error);
            // 检查响应是否已经发送
            if (!res.headersSent) {
                return res.status(500).json({ error: '数据库操作失败' });
            }
        } else {
            // 检查响应是否已经发送
            if (!res.headersSent) {
                res.json({
                    status: 200,
                    message: '视频添加成功',
                    data: {
                        videoId: results.insertId
                    }
                });
            }
        }
    });
};


