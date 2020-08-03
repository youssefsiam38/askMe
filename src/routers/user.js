const express      = require('express')
const router       = express.Router()
const User         = require('../db/models/User.js')
const Question     = require('../db/models/Question.js')
const auth         = require('../middleWares/auth.js')
const optionalAuth = require('../middleWares/optionalAuth.js')
const errorHandler = require('../utils/errorHandler.js')
const thereIsBlock = require('../utils/thereIsBlock.js')
const fs           = require('fs');
const path         = require('path')
const upload       = require('../middleWares/multer.js')

// welcome message
router.get('/', optionalAuth, async (req, res) => {

    try {

        res.send({Message: 'welcome'})
        
    } catch (e) {
        const error = errorHandler(e)
        res.status(error.status).send({ Error: error.errMsg })
    }
})



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

        res.send({ user: user.emitToClient(), token })

    } catch (e) {
        const error = errorHandler(e)
        res.status(error.status).send({ Error: error.errMsg })
    }
})

// add avatar

router.post('/users/avatar', auth, upload.single('avatar'), async (req, res) => {
    try {
        res.sendStatus(200)
    } catch (e) {
        const error = errorHandler(e)
        res.status(error.status).send({ Error: error.errMsg })
    }

})
// delete avatar
router.post('/users/delete/avatar', auth, async (req, res) => {
    try {
        const avatarsPath = path.join(__dirname, '../../public/avatars')
        let deleted = false
        await fs.readdir(avatarsPath, (error, files) => {
            if (error) throw error

            for(let file of files) {
                let parts = file.split('.')
                let extention = parts[parts.length - 1]
                let withoutExtention = file.replace('.' + extention, '')
                if(withoutExtention == req.user.username) {
                    fs.unlinkSync(avatarsPath + '/' + file);
                    deleted = true
                    break
                }
            }
            if(deleted)
                res.sendStatus(200)
            else
                res.sendStatus(404)
        });
    } catch (err) {
        // handle the error
        const error = errorHandler(e)
        res.status(error.status).send({ Error: error.errMsg })
    }
})

// get all users
router.get('/users', optionalAuth, async (req, res) => {
    try {

        // handling the query
        let parts, sortBy, order
        if(req.query.sortBy) {
            parts = req.query.sortBy.split(':')
            sortBy= parts[0]
            order = parts[1]
            if (order !== 'asc' && order !== 'desc') {
                throw { errMsg: 'The sortBy query should followed by desc or asc', status: 400 }
            }
        }

        // get the users
        let users = await User.find({}, null, {
            limit: parseInt(req.query.limit),
            skip: parseInt(req.query.skip),
            sort: {
                [sortBy]: order === 'asc'? 1 : -1
            }
        })

        if(!users.length)
            throw { errMsg: 'There is no users', status: 404 }

        //filter users if there is a block between requester and requested
        users = users.filter((user) => !thereIsBlock(req.user, user))
        

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
router.get('/users/info/:username', optionalAuth, async (req, res) => {

    try {
        let user = (await User.findOne({ username: req.params.username }))
        
        
        if(!user || thereIsBlock(user, req.user))
            throw { errMsg: 'Username not found', status: 404}
        

        res.send(user.emitToClient())
        
    } catch (e) {
        const error = errorHandler(e)
        res.status(error.status).send({ Error: error.errMsg })
    }
})


// block user
router.post('/users/block/:username', auth, async (req, res) => {

    try {
        const user = req.user

        const blockedUser = await User.findOne({ username: req.params.username })

        if(!blockedUser || req.user.username === blockedUser.username)
            throw { errMsg: 'User not found', status: 404 }

        user.blockList.push(blockedUser.username)

        user.save()

        res.send(blockedUser.emitToClient())
    } catch (e) {
        const error = errorHandler(e)
        res.status(error.status).send({ Error: error.errMsg })
    }
})

// unblock user
router.post('/users/unblock/:username', auth, async (req, res) => {

    try {
        const user = req.user

        const unBlockedUser = await User.findOne({ username: req.params.username })

        if(!unBlockedUser)
            throw { errMsg: 'User not found', status: 404 }

        user.blockList = user.blockList.filter((username) => req.params.username !== username)

        user.save()

        res.send(unBlockedUser.emitToClient())
    } catch (e) {
        const error = errorHandler(e)
        res.status(error.status).send({ Error: error.errMsg })
    }
})

// update user
router.patch('/users/update/:username', auth, async (req, res) => {
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

router.delete('/users/delete/:username', auth, async (req, res) => {
    try {
        if (req.params.username !== req.user.username)
            throw { errMsg: 'You are trying to delete another user!!', status: 401 }
        const user = await req.user.remove()
        console.log(user)
        const questions = await Question.deleteMany({ askedTo: user.username })
        console.log(questions.deletedCount)
        res.send(user.emitToClient())
    } catch (e) {
        const error = errorHandler(e)
        res.status(error.status).send({ Error: error.errMsg })
    }
})



module.exports = router