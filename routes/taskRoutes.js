const express = require("express")
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  searchTasks,
  getTaskStats,
  bulkUpdateTasks,
  bulkDeleteTasks,
  getTasksByDateRange,
  duplicateTask,
  getDeletedTasks,
  restoreTask,
} = require("../controllers/taskController")
const { validateRequest, taskSchema, updateTaskSchema } = require("../middleware/validation")
const auth = require("../middleware/auth")

const router = express.Router()

router.use(auth)


router.get("/stats", getTaskStats)


router.get("/search", searchTasks)


router.get("/date-range", getTasksByDateRange)


router.get("/deleted", getDeletedTasks)


router.patch("/bulk", bulkUpdateTasks)

router.delete("/bulk", bulkDeleteTasks)

router.post("/", validateRequest(taskSchema), createTask)

router.get("/", getTasks)

router.get("/:id", getTaskById)

router.put("/:id", validateRequest(updateTaskSchema), updateTask)

router.delete("/:id", deleteTask)

router.post("/:id/duplicate", duplicateTask)

router.patch("/:id/restore", restoreTask)

module.exports = router
