const mongoose = require('mongoose')
require('mongoose')

const questionSchema = new mongoose.Schema({
        Q: {
            type: String,
            required: true,
        },
        A: {
            type: String,
        },
        askedBy: {
            type: String,
            required: true,
            ref: 'User'
        },
        askedTo: {
            type: String,
            ref: 'User'
        }
},{
    timestamps: true
})


// to filter questions from unnecessary fields for the users before sending to them
questionSchema.methods.emitToClient = function() {
    question = this

    const tempQuestion = question.toObject()

    delete tempQuestion.__v

    return tempQuestion
}

const Question = mongoose.model('Question', questionSchema);

module.exports = Question