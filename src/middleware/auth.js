
const User = require("../model/user")

const auth = (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        
        const user = User.find(u=>u.token === token)

        if (!user) {
            throw new Error()
        }

        req.token = token
        req.user = user
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

module.exports = auth