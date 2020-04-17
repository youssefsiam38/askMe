const User     = require('../../src/db/models/User.js')
const Question = require('../../src/db/models/Question.js')
const mongoose = require('mongoose')
const jwt      = require('jsonwebtoken')

const user1Id = mongoose.Types.ObjectId()
const user1 = {
    email: 'shika@bala.com',
    username: 'shikabala',
    password: 'zamalek',
    age: 34,
    blockList: ['ashour'],
    tokens: [ jwt.sign({ _id: user1Id }, process.env.JWT_SECRET) ]
}

const user2Id = mongoose.Types.ObjectId()
const user2 = {
    email: 'hazem@emam.com',
    username: 'emam14',
    password: 'zamalek',
    age: 45,
    blockList: [],
    tokens: [ jwt.sign({ _id: user2Id }, process.env.JWT_SECRET) ]
}

const user3Id = mongoose.Types.ObjectId()
const user3 = {
    email: 'hossam@ashour.com',
    username: 'ashour',
    password: 'ahly',
    age: 34,
    blockList: ['emam14'],
    tokens: [ jwt.sign({ _id: user3Id }, process.env.JWT_SECRET) ]
}

const q1 = {
    Q: 'when will the match be?',
    A: 'tomorrow morning',
    askedBy: 'shikabala',
    askedTo: 'emam14'
}
const q2 = {
    Q: 'can I come to zamalek?',
    askedBy: 'ashour',
    askedTo: 'emam14'
}
const q3 = {
    Q: 'when will you come',
    A: '10 o\'clock',
    askedBy: 'emam14',
    askedTo: 'shikabala'
}

const setupDB = async () => {

    await User.deleteMany()
    await Question.deleteMany()
    await new User(user1).save()
    await new User(user2).save()
    await new User(user3).save()
    await new Question(q1).save()
    await new Question(q2).save()
    await new Question(q3).save()
}

module.exports = {
    user1,
    user2,
    user3,
    q1,
    q2,
    q3,
    setupDB
}