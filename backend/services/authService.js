const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const mysql = require("../config/mysql")

const authService = {
  async registerUser({ name, email, password }) {
    const connection = await mysql.getConnection()

    try {
      const [existingUsers] = await connection.execute("SELECT id FROM users WHERE email = ?", [email])

      if (existingUsers.length > 0) {
        throw new Error("User already exists with this email")
      }

      const saltRounds = 12
      const hashedPassword = await bcrypt.hash(password, saltRounds)

      const [result] = await connection.execute(
        "INSERT INTO users (name, email, passwordHash) VALUES (?, ?, ?)",
        [name, email, hashedPassword],
      )

      const userId = result.insertId

      const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })

      return {
        user: { id: userId, name, email },
        token,
      }
    } finally {
      connection.release()
    }
  },

  async loginUser({ email, password }) {
    const connection = await mysql.getConnection()

    try {
      const [users] = await connection.execute("SELECT id, name, email, passwordHash FROM users WHERE email = ?", [email])

      if (users.length === 0) {
        throw new Error("Invalid email or password")
      }

      const user = users[0]

      const isValidPassword = await bcrypt.compare(password, user.passwordHash)
      if (!isValidPassword) {
        throw new Error("Invalid email or password")
      }

      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      })

      return {
        user: { id: user.id, name: user.name, email: user.email },
        token,
      }
    } finally {
      connection.release()
    }
  },

  async getUserProfile(userId) {
    const connection = await mysql.getConnection()

    try {
      const [users] = await connection.execute("SELECT id, name, email, createdAt FROM users WHERE id = ?", [userId])

      if (users.length === 0) {
        throw new Error("User not found")
      }

      return users[0]
    } finally {
      connection.release()
    }
  },
}

module.exports = authService
