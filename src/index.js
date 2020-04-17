const app = require('./app.js')

const port = process.env.PORT


app.listen(port, () => {
    console.log('server is listening on port ' + port)
})