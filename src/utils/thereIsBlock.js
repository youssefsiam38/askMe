
const thereIsBlock = (user1, user2) => {
    try {
        if (user1.blockList.length && user1.blockList.includes(user2.username))
            return true
        if (user2.blockList.length && user2.blockList.includes(user1.username))
            return true
        return false
    } catch (e) {
        return false
    }
}

module.exports = thereIsBlock