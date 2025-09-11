const express = require("express")
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
  bulkUpdateTasks,
} = require("../controllers/taskController")
const { auth } = require("../middleware/auth")
const { validateTask, validateTaskUpdate } = require("../middleware/validation")

const router = express.Router()

// Apply authentication middleware to all routes
router.use(auth)

// Task CRUD routes
router.get("/", getTasks)
router.get("/stats", getTaskStats)
router.get("/:id", getTask)
router.post("/", validateTask, createTask)
router.put("/:id", validateTaskUpdate, updateTask)
router.delete("/:id", deleteTask)

router.patch("/bulk", bulkUpdateTasks)

module.exports = router
