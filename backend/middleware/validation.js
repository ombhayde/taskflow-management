const validateRegistration = (req, res, next) => {
  const { name, email, password } = req.body

  if (!name || name.trim().length < 2) {
    return res.status(400).json({
      status: "error",
      message: "Name must be at least 2 characters long",
    })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({
      status: "error",
      message: "Please provide a valid email address",
    })
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      status: "error",
      message: "Password must be at least 6 characters long",
    })
  }

  next()
}

const validateLogin = (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      status: "error",
      message: "Email and password are required",
    })
  }

  next()
}

const validateTask = (req, res, next) => {
  const { title } = req.body

  if (!title || title.trim().length === 0) {
    return res.status(400).json({
      status: "error",
      message: "Task title is required",
    })
  }

  if (title.trim().length > 255) {
    return res.status(400).json({
      status: "error",
      message: "Task title must be less than 255 characters",
    })
  }

  next()
}

const validateTaskUpdate = (req, res, next) => {
  const { title, description, status, priority } = req.body

  // At least one field must be provided for update
  if (!title && !description && !status && !priority) {
    return res.status(400).json({
      status: "error",
      message: "At least one field (title, description, status, priority) must be provided for update",
    })
  }

  // Validate title if provided
  if (title !== undefined) {
    if (title.trim().length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Task title cannot be empty",
      })
    }
    if (title.trim().length > 255) {
      return res.status(400).json({
        status: "error",
        message: "Task title must be less than 255 characters",
      })
    }
  }

  // Validate status if provided
  if (status !== undefined) {
    const validStatuses = ['todo', 'in-progress', 'completed']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Status must be one of: todo, in-progress, completed",
      })
    }
  }

  // Validate priority if provided
  if (priority !== undefined) {
    const validPriorities = ['low', 'medium', 'high']
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        status: "error",
        message: "Priority must be one of: low, medium, high",
      })
    }
  }

  next()
}

module.exports = {
  validateRegistration,
  validateLogin,
  validateTask,
  validateTaskUpdate,
}
