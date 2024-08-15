const express = require('express')

const router = express.Router()

const userinfo_handler = require('../router_handle/userinfo')

router.get('/userinfo',userinfo_handler.getUserInfo)//从token获取信息

router.get('/oneuserinfo',userinfo_handler.getOneUserInfo)//ui获取信息

module.exports = router