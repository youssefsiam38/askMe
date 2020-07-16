const app = require('./app.js')

const port = parseInt(process.env.PORT)


app.listen(port, () => {
    console.log('server is listening on port ' + port)
})