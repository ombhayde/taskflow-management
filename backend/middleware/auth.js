const jwt = require("jsonwebtoken")

const auth = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")
    
    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Access denied. No token provided.",
      })
    } // ✅ Add closing brace for if statement
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({
      status: "error",
      message: "Invalid token.",
    })
  } // ✅ Add closing brace for try-catch
} // ✅ Add closing brace for auth function

module.exports = { auth, authenticateToken: auth }
