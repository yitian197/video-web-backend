const express = require('express')

const router = express.Router()

const book_handle = require('../router_handle/postbook')

router.post('/postbook',book_handle.postbook)

module.exports = router