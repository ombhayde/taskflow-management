const Joi = require("joi")

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body)
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
      })
    }
    next()
  }
}

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
})

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
})

const taskSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(1000).optional(),
  status: Joi.string().valid("todo", "in-progress", "done").default("todo"),
})

const updateTaskSchema = Joi.object({
  title: Joi.string().min(1).max(200).optional(),
  description: Joi.string().max(1000).optional(),
  status: Joi.string().valid("todo", "in-progress", "done").optional(),
})

const bulkUpdateSchema = Joi.object({
  taskIds: Joi.array().items(Joi.string().required()).min(1).required(),
  updateData: Joi.object({
    title: Joi.string().min(1).max(200).optional(),
    description: Joi.string().max(1000).optional(),
    status: Joi.string().valid("todo", "in-progress", "done").optional(),
  })
    .min(1)
    .required(),
})

const bulkDeleteSchema = Joi.object({
  taskIds: Joi.array().items(Joi.string().required()).min(1).required(),
})

const dateRangeSchema = Joi.object({
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref("startDate")).required(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
})

module.exports = {
  validateRequest,
  registerSchema,
  loginSchema,
  taskSchema,
  updateTaskSchema,
  bulkUpdateSchema,
  bulkDeleteSchema,
  dateRangeSchema,
}
