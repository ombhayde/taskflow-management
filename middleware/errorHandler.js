const errorHandler = (err, req, res, next) => {
  let error = { ...err }
  error.message = err.message

  console.error("Error:", err)

  if (err.name === "CastError") {
    const message = "Invalid resource ID"
    error = { message, statusCode: 400 }
  }

  if (err.code === 11000) {
    const message = "Duplicate field value entered"
    error = { message, statusCode: 400 }
  }

  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ")
    error = { message, statusCode: 400 }
  }

  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token"
    error = { message, statusCode: 401 }
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired"
    error = { message, statusCode: 401 }
  }

  if (err.code === "ER_DUP_ENTRY") {
    const message = "Email already exists"
    error = { message, statusCode: 400 }
  }

  res.status(error.statusCode || 500).json({
    status: "error",
    message: error.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  })
}

module.exports = errorHandler
