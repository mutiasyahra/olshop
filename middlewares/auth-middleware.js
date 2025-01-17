const jwt = require('jsonwebtoken')
const SECRET_KEY = 'olshop-secret-2024'

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization")
    if (!token) {
        return res.status(401).json({ message: "Access Denied" })
    }
    
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(401).json({ message: "Invalid Token" })
        }
        req.user = user
        next()
    })
}

module.exports = authMiddleware