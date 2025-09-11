const jwt = require("jsonwebtoken")
const { getConnection } = require("../config/mysql")

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Access denied. No token provided.",
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const connection = getConnection()
    const [rows] = await connection.execute("SELECT id, name, email FROM users WHERE id = ?", [decoded.userId])

    if (rows.length === 0) {
      return res.status(401).json({
        status: "error",
        message: "Invalid token. User not found.",
      })
    }

    req.user = rows[0]
    next()
  } catch (error) {
    res.status(401).json({
      status: "error",
      message: "Invalid token.",
    })
  }
}

module.exports = auth
