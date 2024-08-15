const express = require('express')

const router = express.Router()

const userHandle = require('../router_handle/user')
const categoryHandle = require('../router_handle/category')
const getVideos = require('../router_handle/getvideos')

router.post('/reguser',userHandle.regUser)

router.post('/login',userHandle.login)

router.get('/category',categoryHandle.getCategory)

router.get('/getrandomvideos',getVideos.getRandomVideos)

router.get('/getvideo',getVideos.getvideosDetail)

router.get('/v3/',getVideos.getDanmu)

router.post('/v3/',getVideos.postDanmu)

module.exports = router