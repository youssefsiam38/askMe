const express    = require('express')
const app        = express()
const userRouter = require('./routers/user.js')
const questionRouter = require('./routers/question.js')
require('./db/mongoose.js')


// app.use(express.static())
app.use(express.json())


    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type')
        res.setHeader('Access-Control-Allow-Methods', '*')

        next()
    })

app.use(questionRouter)
app.use(userRouter)

module.exports = app