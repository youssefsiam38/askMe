const User         = require('../db/models/User.js')
const jwt          = require('jsonwebtoken')
const errorHandler = require('../utils/errorHandler.js')

const optionalAuth = async (req, res, next) => {

    try {
        let tokenWithBearer = req.header('Authorization')
        
        if(!tokenWithBearer){
            return next()
        }
        
        const token = tokenWithBearer.replace('Bearer ', '')
        const { _id } = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(_id)
        
        if(!user)
            throw { errMsg: 'You are not logged in', status: 401 }
        
        req.user = user
        req.token = token
        next()
        
    } catch (e) {
        const error = errorHandler(e)
        res.status(error.status).send({ Error: error.errMsg })
    }
} 

module.exports = optionalAuth