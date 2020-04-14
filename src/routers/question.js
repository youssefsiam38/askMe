const express = require('express')
const router = new express.Router()
const User = require('../db/models/User.js')
const Question = require('../db/models/Question.js')
const errorHandler = require('../utils/errorHandler.js')
const questionsGetter = require('../utils/questionsGetter.js')
const auth = require('../middleWares/auth.js')


// ask a question
router.post('/questions/ask/:askedTo', auth, async (req, res) => {
    try {

        const askedUser = await User.findOne({ username: req.params.askedTo })

        //check if user is found
        if (!askedUser)
            throw { errMsg: 'user not found', status: 404 }

        if (req.user.username === askedUser.username)
            throw { errMsg: 'you can\'t ask yourself', status: 400 }

        const question = new Question({
            Q: req.body.question,
            askedBy: req.user.username,
            askedTo: req.params.askedTo
        })

        await question.save()

        res.send(question.emitToClient())

    } catch (e) {
        const error = errorHandler(e)
        res.status(error.status).send({ Error: error.errMsg })
    }

})

// answer a question
router.post('/questions/answer/:id', auth, async (req, res) => {
    try {
        const user = req.user

        const question = await Question.findById(req.params.id)

        if (!question)
            throw { errMsg: 'Question not found', status: 404 }

        if (question.askedTo !== user.username)
            throw { errMsg: 'This question is not asked to you', status: 401 }

        question.A = req.body.answer
        await question.save()

        res.send(question.emitToClient())
    } catch (e) {
        const error = errorHandler(e)
        res.status(error.status).send({ Error: error.errMsg })
    }
})

// get questions asked to me and not answerd
router.get('/questions', auth, async (req, res) => {

    try {
        let parts, sortBy, order
        if (req.query.sortBy) {
            parts = req.query.sortBy.split(':')
            sortBy = parts[0]
            order = parts[1]

            // check that the order is ASC or DESC    
            if (order !== 'asc' && order !== 'desc') {
                throw { errMsg: 'The sortBy query should followed by desc or asc', status: 400 }
            }
        }

        const questions = await Question.find({ askedTo: req.user.username }, null, {
            limit: parseInt(req.query.limit),
            skip: parseInt(req.query.skip),
            sort: {
                [sortBy]: order === 'asc' ? 1 : -1
            }
        }).exists('A', false)

        if (questions == false)
            throw { errMsg: 'Questions not found', status: 404 }

        const tempQuestions = []
        for (let q of questions) {
            tempQuestions.push(q.emitToClient())
        }

        res.send(tempQuestions)
    } catch (e) {
        const error = errorHandler(e)
        res.status(error.status).send({ Error: error.errMsg })
    }


})




// get questions asked by or asked to specific User
// LIKE --> {{url}}/questions/askedBy/mohamed
router.get('/questions/:query/:username', questionsGetter)






// update question 
router.patch('/questions/update/:id', auth, async (req, res) => {

    try {
        const id = req.params.id
        const question = await Question.findById(id)

        if (!question)
            throw { errMsg: 'Question not found', status: 404 }

        //make sure that who trying to update the Q is who asked it
        if (question.askedBy === req.user.username && req.body.question) {

            question.Q = req.body.question
            await question.save()

            //make sure that who trying to update the A is who answered it
        } else if (question.askedTo === req.user.username && req.body.answer) {

            question.A = req.body.answer
            await question.save()

        } else
            throw { errMsg: 'You are not allowd to update this question', status: 405 }



        res.send(question.emitToClient())

    } catch (e) {
        const error = errorHandler(e)
        res.status(error.status).send({ Error: error.errMsg })
    }

})




// delete a question
router.delete('/questions/delete/:id', auth, async (req, res) => {

    try {
        const id = req.params.id
        const question = await Question.findById(id)

        if (!question)
            throw { errMsg: 'Question not found', status: 404 }

        if (question.askedBy !== req.user.username && question.askedTo !== req.user.username)
            throw { errMsg: 'You are not allowd to delete this question', status: 405 }

        await question.remove()

        res.send(question.emitToClient())

    } catch (e) {
        const error = errorHandler(e)
        res.status(error.status).send({ Error: error.errMsg })
    }



})

module.exports = router