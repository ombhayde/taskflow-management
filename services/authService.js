const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

class AuthService {
  async hashPassword(password) {
    const saltRounds = 12
    return await bcrypt.hash(password, saltRounds)
  }

  async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword)
  }

  generateToken(userId) {
    const payload = {
      userId,
      iat: Math.floor(Date.now() / 1000),
    }

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    })
  }

  verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET)
  }

  decodeToken(token) {
    return jwt.decode(token)
  }
}

module.exports = new AuthService()
