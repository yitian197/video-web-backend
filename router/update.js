const {updata_avatar_schema} = require('../schema/user')
const express = require('express')

const router = express.Router()

// 结束
const updateHandle = require('../router_handle/update')

router.post('/avatar',updateHandle.uploadAvatar)

router.put('/user',updateHandle.updateUser)

module.exports = router