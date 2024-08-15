const express = require('express')

const router = express.Router()

const getbook_handle = require('../router_handle/getbook')

router.get('/getbook',getbook_handle.getbook)

module.exports = router