const errorHandler = (err, req, res, next) => {
  console.error("Error:", err)

  // Default error
  const error = {
    status: "error",
    message: err.message || "Internal server error",
  }

  // Specific error handling
  if (err.code === "ER_DUP_ENTRY") {
    error.message = "Resource already exists"
    return res.status(409).json(error)
  }

  if (err.name === "ValidationError") {
    error.message = "Validation failed"
    return res.status(400).json(error)
  }

  if (err.name === "JsonWebTokenError") {
    error.message = "Invalid token"
    return res.status(401).json(error)
  }

  if (err.name === "TokenExpiredError") {
    error.message = "Token expired"
    return res.status(401).json(error)
  }

  // Default server error
  res.status(500).json(error)
}

module.exports = errorHandler
