const User         = require('../db/models/User.js')
const jwt          = require('jsonwebtoken')
const errorHandler = require('../utils/errorHandler.js')

const auth = async (req, res, next) => {

    try {
        const token = req.header('Authorization').replace('Bearer ', '')
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

module.exports = auth