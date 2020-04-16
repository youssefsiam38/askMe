const Question     = require('../db/models/Question.js')
const User         = require('../db/models/User.js')
const errorHandler = require('../utils/errorHandler.js')
const thereIsBlock = require('../utils/thereIsBlock.js')

const questionsGetter = async (req, res) => {
    
    try {
        let parts, sortBy, order
        if(req.query.sortBy) {
            parts = req.query.sortBy.split(':')
            sortBy= parts[0]
            order = parts[1]
        }

        // get the asked user
        const askedUser = await User.findOne({ username: req.params.username })

        if(!askedUser || thereIsBlock(askedUser, req.user))
            throw { errMsg: 'user not found', status: 404 }


        // check that the order is ASC or DESC
        const notAscOrDesc = req.query.sortBy && order !== 'asc' && order !== 'desc'

        // check that query has ASKEDBY or ASKEDTO
        const notAskedByOrTo = req.params.query !== 'askedBy' && req.params.query !== 'askedTo'

        //check that the query is valid
        if( notAscOrDesc || notAskedByOrTo )
            throw { errMsg: 'Invalid request', status: 400 }
            
        const questions = await Question.find({ [req.params.query]: req.params.username }, null, {
            limit: parseInt(req.query.limit),
            skip: parseInt(req.query.skip),
            sort: {
                [sortBy]: order === 'asc'? 1 : -1
            }
        }).exists('A')
            
        if(!questions.length)
            throw { errMsg: 'Questions not found', status: 404 }

        const tempQuestions = []
        for(let q of questions){
            tempQuestions.push(q.emitToClient())
        }

        res.send(tempQuestions)

        
    } catch (e) {
        const error = errorHandler(e)
        res.status(error.status).send({ Error: error.errMsg })
    }
}

module.exports = questionsGetter