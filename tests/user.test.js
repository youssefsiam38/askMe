const User = require('../src/db/models/User.js')
const request = require('supertest')
const app = require('../src/app.js')
const { user1, user2, user3, q1, q2, q3, setupDB } = require('./fixtures/db.js')


beforeEach(setupDB)


test('should signup new user', async () => {
    const newUser = {
        email: 'tarek@elsayed.com',
        username: 'tarek',
        password: 'zamalek',
        age: 41,
    }

    const res = await request(app)
                            .post('/signup')
                            .send(newUser)
                            .expect(201)
    const user = await User.findOne({ username: res.body.user.username })

    expect(user).not.toBeNull()

    expect(user).toMatchObject(newUser)
})


test('should not signup user with existing username or email', async () => {
    const newUser = {
        email: 'shika@bala.com',
        username: 'sh',
        password: 'zamalek',
        age: 41,
    }

    await request(app)
                            .post('/signup')
                            .send(newUser)
                            .expect(400)
    
    const notUser1 = await User.findOne({ username: newUser.username })
    
    expect(notUser1).toBeNull()


    // change the duplicated email and put duplicated username
    newUser.email = 'shikabala@z.com'
    newUser.username = 'shikabala'

    await request(app)
                            .post('/signup')
                            .send(newUser)
                            .expect(400)


})

test('should login using email', async () => {

    const userCredentials = {
        email: user2.email,
        password: user2.password
    }
    const res = await request(app)
                            .post('/login')
                            .send(userCredentials)
                            .expect(200)
    const user = await User.findOne({ username: res.body.user.username })

    expect(user).not.toBeNull()

})

test('should login using username', async () => {

    const userCredentials = {
        username: user2.username,
        password: user2.password
    }
    const res = await request(app)
                            .post('/login')
                            .send(userCredentials)
                            .expect(200)
    const user = await User.findOne({ username: res.body.user.username })

    expect(user).not.toBeNull()

})

test('should not login not existing user', async () => {

    const userCredentials = {
        username: user2.username + 10,
        password: user2.password
    }
    const res = await request(app)
                            .post('/login')
                            .send(userCredentials)
                            .expect(404)
})

test('should not login user with wrong password', async () => {

    const userCredentials = {
        username: user2.username,
        password: user2.password + 10
    }

    await request(app)
                            .post('/login')
                            .send(userCredentials)
                            .expect(401)
    const user = await User.findOne({ username: userCredentials.username })

    expect(user.password).not.toBe(userCredentials.password)

})