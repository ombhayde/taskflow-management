const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { getConnection } = require("../config/mysql")
const authService = require("../services/authService")

const register = async (req, res) => {
  const { name, email, password } = req.body

  try {
    const connection = getConnection()

    const [existingUsers] = await connection.execute("SELECT id FROM users WHERE email = ?", [email])

    if (existingUsers.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "User with this email already exists",
      })
    }

    const passwordHash = await authService.hashPassword(password)

    const [result] = await connection.execute("INSERT INTO users (name, email, passwordHash) VALUES (?, ?, ?)", [
      name,
      email,
      passwordHash,
    ])

    const [newUser] = await connection.execute("SELECT id, name, email, createdAt FROM users WHERE id = ?", [
      result.insertId,
    ])

    const token = authService.generateToken(result.insertId)

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: {
        user: newUser[0],
        token,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({
      status: "error",
      message: "Internal server error during registration",
    })
  }
}

const login = async (req, res) => {
  const { email, password } = req.body

  try {
    const connection = getConnection()

    const [users] = await connection.execute("SELECT id, name, email, passwordHash FROM users WHERE email = ?", [email])

    if (users.length === 0) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      })
    }

    const user = users[0]

    const isPasswordValid = await authService.comparePassword(password, user.passwordHash)

    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      })
    }

    const token = authService.generateToken(user.id)

    const { passwordHash, ...userWithoutPassword } = user

    res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        user: userWithoutPassword,
        token,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      status: "error",
      message: "Internal server error during login",
    })
  }
}

const getProfile = async (req, res) => {
  try {
    const connection = getConnection()

    const [users] = await connection.execute("SELECT id, name, email, createdAt FROM users WHERE id = ?", [req.user.id])

    if (users.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      })
    }

    res.status(200).json({
      status: "success",
      data: {
        user: users[0],
      },
    })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    })
  }
}

module.exports = {
  register,
  login,
  getProfile,
}
