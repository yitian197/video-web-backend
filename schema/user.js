const joi = require('@hapi/joi')

//定义验证头像的验证规则
const avatar = joi.string().dataUri().required()

exports.updata_avatar_schema = {
    body:{
        avatar
    }
}