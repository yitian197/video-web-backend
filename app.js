const express = require('express')
const app = express()

const cors = require('cors')

const path = require('path');
const multer = require('multer');

// // 邮箱测试
// const nodemailer = require('nodemailer')
// async function sendVerificationCode(email, code) {
//   let transporter = nodemailer.createTransport({
//       host:'smtp.qq.com',
//       port: 465,
//       secure:true,
//       auth: {
//           user: 'yitianwork@foxmail.com', // 你的邮箱账号
//           pass: 'rhoimtyzzhnachfd' // 你的邮箱密码（或者使用授权码）
//       }
//   });

//   let mailOptions = {
//       from: '"斧头sb" <yitianwork@foxmail.com>', // 发送者地址
//       to: email, // 接收者列表
//       subject: '验证码 ✔', // 主题行
//       text: '你的验证码是: ' + code, // 纯文本正文
//       html: '<b>你的验证码是:</b> ' + code // HTML正文
//   };

//   let info = await transporter.sendMail(mailOptions);

//   console.log('Message sent: %s', info.messageId);
// }

// // 假设我们有一个用户邮箱和生成的验证码
// let userEmail = '1151054189@qq.com';
// var verificationCode = Math.floor(Math.random() * 100000).toString().padStart(6, '0');

// sendVerificationCode(userEmail, verificationCode).catch(console.error);
// // 邮箱测试

// 设置 multer 存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public', 'upload'));
  },
  filename: (req, file, cb) => {
    const user = req.user; // 解析后的用户信息
    if (!user) {
      return cb(new Error('用户未认证'), null);
    }

    const ext = path.extname(file.originalname);
    const timestamp = Date.now();

    const filename = `${user.uid}_${timestamp}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({ storage: storage });


app.use(express.static("./public"))

app.use(cors({
  origin: 'http://localhost:8080',  // 允许的来源
  credentials: true  // 允许凭证
}));

app.use(express.urlencoded({ extended: false }))

app.use(express.json()); 


const expressJWT = require('express-jwt')
const config = require('./config')

app.use(
  expressJWT({ secret: config.jwtSecretKey, algorithms: ['HS256'] }).unless({
    path: [
      /^\/api\//, // 匹配以 /api/ 开头的所有路径
      /^\/search\//,  // 确保 /search 不被 JWT 验证
      /^\/public\//, 
      /^\/user\/oneuserinfo(\/.*)?$/, 
    ]
  })
);

const InfoRouter = require('./router/info')
app.use('/api',InfoRouter)

const userinfoRouter = require('./router/userinfo')
app.use('/user',userinfoRouter)

const search = require('./router/search')
app.use('/search',search)

const updateRouter = require('./router/update')
app.use('/update',upload.single('avatar'),updateRouter)

const videoRouter = require('./router/video')
app.use('/video',videoRouter)

const followRouter = require('./router/follow')
app.use(followRouter)

// app.get('/getuserinfo',function(req,res){
//   console.log(req.user)
//   res.send({
//     status:200,
//     message:'获取用户信息成功',
//     data:req.user
//   })
// })

// app.post('/api/login',function(req,res){
//   const userinfo = req.body
//   console.log(userinfo)
//   if(userinfo.username !== 'admin' || userinfo.password != '000000'){
//     return res.send({
//       status:400,
//       message:'登录失败'
//     })
//   }
//   const tokenStr = jwt.sign({username:userinfo.username},secretKey,{expiresIn:'120s'})

//   const userObject = {
//     username: userinfo.username,
//     // 可以根据需要添加更多属性
//   };

//   res.send({
//     status:200,
//     message:'登录成功！',
//     token:tokenStr,
//     user:userObject,
//   })
// })

// app.get('/',(req,res)=>{
//   console.log(req.query)
//   res.send(req.query)
// })

app.listen(5050,()=>{
  console.log('express')
})
