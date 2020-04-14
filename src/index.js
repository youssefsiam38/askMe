const express    = require('express')
const app        = express()
const userRouter = require('./routers/user.js')
const questionRouter = require('./routers/question.js')
require('./db/mongoose.js')

const port = process.env.PORT

// app.use(express.static())
app.use(express.json())

app.use(questionRouter)
app.use(userRouter)

app.listen(port, () => {
    console.log('server is listening on port ' + port)
})