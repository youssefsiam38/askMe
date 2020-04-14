const mongoose = require('mongoose')

mongoose.connect(process.env.MONGOOSE_URL, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
})