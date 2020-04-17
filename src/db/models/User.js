const mongoose  = require('mongoose')
const validator = require('validator')
const jwt       = require('jsonwebtoken')
require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate(value) {
            if(!validator.isAlphanumeric(value) || !validator.isLowercase(value))
                throw 'Please enter username without symbols or uppercase letters'
        }
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate(value) {
            if(!validator.isEmail(value))
                throw 'Your Email is invalid'
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if(!validator.isLowercase(value))
                throw 'Please enter you password without uppercase charactars'
        }
    },
    age: {
        type: Number,
        default: 0
    },
    blockList: {
        type: [String]
    },
    tokens: {
        type: [String],
        required: true,
        validate(value) {
            const lastToken = value[value.length - 1]
            if(!validator.isJWT(lastToken))
                throw 'login has failed please try again'
        }
    }
}, {
    timestamps: true
})

userSchema.virtual('askedTo', {
    ref:'Question',
    localField: 'username',
    foreignField: 'askedTo'
})


// generate awt token
userSchema.methods.generateToken = async function() {
    const user = this
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET)
    user.tokens.push(token)
    await user.save()

    return token
}

// to filter users from unnecessary fields for the users before sending to them
userSchema.methods.emitToClient = function() {
    const user = this
    
    
    const tempUser = user.toObject()

    delete tempUser._id
    delete tempUser.password
    delete tempUser.__v
    delete tempUser.tokens
    delete tempUser.email
    delete tempUser.blockList

    return tempUser

}


userSchema.statics.findBycredentials = async (emailOrUsername, password) => {

        let user
    
        if(validator.isEmail(emailOrUsername))
            user = await User.findOne({ email: emailOrUsername })
        else{
            user = await User.findOne({ username: emailOrUsername })
        }

        if(!user)
            throw { errMsg: 'This username or email not is our database try to signup', status: 404 }
        
        if(user.password != password){
            throw { errMsg: 'This password is wrong, Kindly try again', status: 401 }
        }
    
    
        return user
        
    
}

const User = mongoose.model('User', userSchema)

module.exports = User