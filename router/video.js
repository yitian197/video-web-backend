const express = require('express')

const router = express.Router()

const multer = require('multer');

const path = require('path');
const fs = require('fs');

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname,'..' ,'public', 'upload', 'videos'));
  },
});

const CoverStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname,'..' ,'public', 'upload', 'cover'));
  },
  filename: (req, file, cb) => {
    const filename = `${file.originalname}`;
    cb(null, filename);
  }
});

const renameFileMiddleware = (req, res, next) => {
    if (!req.file) {
      return next(); // 没有文件上传时跳过
    }
    const { fileMd5, chunk } = req.body;
    if (!fileMd5 || chunk === undefined) {
      return res.status(400).json({ error: '缺少必要的字段 fileMd5 或 chunk' });
    }
  
    const newFilename = `${fileMd5}-${chunk}`;
    const oldPath = req.file.path;

    const targetDir = path.join(path.dirname(oldPath), fileMd5); // 目标目录路径
    const newPath = path.join(targetDir, newFilename); // 新文件路径
  
    // 确保目标目录存在
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }
  
    // 重命名文件
    fs.rename(oldPath, newPath, (err) => {
      if (err) {
        return next(err);
      }
      req.file.path = newPath; // 更新 req.file 的路径
      req.file.filename = newFilename; // 更新 req.file 的文件名
      next();
    });
 };

const uploadVideo = multer({ storage: videoStorage });
const uploadCover = multer({ storage: CoverStorage });


// 结束
const updateHandle = require('../router_handle/video')

router.post('/upload',uploadVideo.single('video'),renameFileMiddleware,updateHandle.uploadVideo)

router.post('/check',updateHandle.getUploadStatus)

router.post('/add',uploadCover.single('cover'),updateHandle.addVideo)

module.exports = router