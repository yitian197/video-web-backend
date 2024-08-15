const express = require('express')

const router = express.Router()

const followHandle = require('../router_handle/follow')

router.post('/follow',followHandle.toggleFollow)

module.exports = router