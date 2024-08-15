const express = require('express')

const router = express.Router()

const getbookid_handle = require('../router_handle/getbookid')

router.post('/getbookid',getbookid_handle.getbookid)

module.exports = router