const authService = require("../services/authService")

const authController = {
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body

      if (!name || !email || !password) {
        return res.status(400).json({
          status: "error",
          message: "Name, email, and password are required",
        })
      }

      const result = await authService.registerUser({ name, email, password })

      res.status(201).json({
        status: "success",
        message: "User registered successfully",
        data: result,
      })
    } catch (error) {
      next(error)
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        return res.status(400).json({
          status: "error",
          message: "Email and password are required",
        })
      }

      const result = await authService.loginUser({ email, password })

      res.json({
        status: "success",
        message: "Login successful",
        data: result,
      })
    } catch (error) {
      next(error)
    }
  },

  async getProfile(req, res, next) {
    try {
      const userId = req.user.id
      const user = await authService.getUserProfile(userId)

      res.json({
        status: "success",
        data: { user },
      })
    } catch (error) {
      next(error)
    }
  },
}

module.exports = authController
