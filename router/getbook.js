const express = require('express')

const router = express.Router()

const getbook_handle = require('../router_handle/getbook')

router.post('/getbook',getbook_handle.getbook)

module.exports = router