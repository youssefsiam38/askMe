const express = require('express')
const router = new express.Router()
const User = require('../db/models/User.js')
const auth = require('../middleWares/auth.js')
const errorHandler = require('../utils/errorHandler.js')

//signup
router.post('/signup', async (req, res) => {
    try {
        const notAllowedUserNames = ['users', 'signup', 'login']
        if(notAllowedUserNames.includes(req.body.username))
            throw { errMsg: 'This username is not allowed, Kindly pick another one', status: 400 }
        const user = new User(req.body)

        const token = await user.generateToken()

        res.status(201).send({ user: user.emitToClient(), token })

    } catch (e) {
        const error = errorHandler(e)
        res.status(error.status).send({ Error: error.errMsg })
    }
})

//login
router.post('/login', async (req, res) => {
    try {
        let user
        if (req.body.username)
            user = await User.findBycredentials(req.body.username, req.body.password)
        else
            user = await User.findBycredentials(req.body.email, req.body.password)



        const token = await user.generateToken()

        res.status(200).send({ user: user.emitToClient(), token })

    } catch (e) {
        const error = errorHandler(e)
        res.status(error.status).send({ Error: error.errMsg })
    }
})

// get all users
router.get('/users', async (req, res) => {
    try {

        let parts, sortBy, order
        if(req.query.sortBy) {
            parts = req.query.sortBy.split(':')
            sortBy= parts[0]
            order = parts[1]
            if (order !== 'asc' && order !== 'desc') {
                throw { errMsg: 'The sortBy query should followed by desc or asc', status: 400 }
            }
        }

        const users = await User.find({}, null, {
            limit: parseInt(req.query.limit),
            skip: parseInt(req.query.skip),
            sort: {
                [sortBy]: order === 'asc'? 1 : -1
            }
        })

        if(users == false)
        throw { errMsg: 'There is no users', status: 404 }



        const filteredUsers = []
        let tempUser

        for(let user of users) {
            
            tempUser = user.emitToClient();
            filteredUsers.push(tempUser);
            
        }
        
        res.status(200).send(filteredUsers)
        
    } catch (e) {
        const error = errorHandler(e)
        res.status(error.status).send({ Error: error.errMsg })
    }
})

// get user info
router.get('/:username/info', async (req, res) => {

    try {
        let user = (await User.findOne({ username: req.params.username }))
        
        
        if(!user)
            throw { errMsg: 'Username not found', status: 404}
        

        res.send(user.emitToClient())
        
    } catch (e) {
        const error = errorHandler(e)
        res.status(error.status).send({ Error: error.errMsg })
    }
})

// update user
router.patch('/:username/update', auth, async (req, res) => {
    try {
        const validUpdates = ['password', 'age']
        const user = req.user
        if (user.username !== req.params.username)
            throw { errMsg: 'You are trying to update another users credentials!!', status: 401 }


        for (let key in req.body) {
            if (validUpdates.includes(key)) 
                user[key] = req.body[key]
            else
                throw { errMsg: `You can't update your ${key}`, status: 400 }
        }
        await user.save()

        res.status(200).send(user.emitToClient())



    } catch (e) {
        const error = errorHandler(e)
        res.status(error.status).send({ Error: error.errMsg })

    }

})

router.delete('/:username/delete', auth, async (req, res) => {
    try {
        if (req.params.username !== req.user.username)
            throw { errMsg: 'You are trying to delete another user!!', status: 401 }
        const user = await req.user.remove()
        res.send(user.emitToClient())
    } catch (e) {
        const error = errorHandler(e)
        res.status(error.status).send({ Error: error.errMsg })
    }
})



module.exports = router