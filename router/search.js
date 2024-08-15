const express = require('express')

const router = express.Router()

const Search_handler = require('../router_handle/search')

router.get('/user',Search_handler.SearchUser)

router.get('/all',Search_handler.SearchVideo)

module.exports = router