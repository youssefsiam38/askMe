const mongoose = require('mongoose')

mongoose.connect(process.env.MONGOOSE_URL, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
    // pass: process.env.MONGO_PASS,
    // user: process.env.MONGO_USERNAME,
})