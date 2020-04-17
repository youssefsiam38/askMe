const express    = require('express')
const app        = express()
const userRouter = require('./routers/user.js')
const questionRouter = require('./routers/question.js')
require('./db/mongoose.js')


// app.use(express.static())
app.use(express.json())

app.use(questionRouter)
app.use(userRouter)

module.exports = app