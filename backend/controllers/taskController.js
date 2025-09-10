const Task = require("../models/Task")
const taskService = require("../services/taskService")

// Get all tasks for user with pagination and filtering
const getTasks = async (req, res) => {
  try {
    const userId = req.user.id
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      startDate,
      endDate,
    } = req.query

    const result = await taskService.getTasks(userId, {
      page: Number.parseInt(page),
      limit: Number.parseInt(limit),
      status,
      priority,
      search,
      sortBy,
      sortOrder,
      startDate,
      endDate,
    })

    res.status(200).json({
      status: "success",
      data: result,
    })
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    })
  }
}

// Get single task
const getTask = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const task = await Task.findOne({ _id: id, userId })

    if (!task) {
      return res.status(404).json({
        status: "error",
        message: "Task not found",
      })
    }

    res.status(200).json({
      status: "success",
      data: { task },
    })
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    })
  }
}

// Create new task
const createTask = async (req, res) => {
  try {
    const userId = req.user.id
    const taskData = { ...req.body, userId }

    const task = await taskService.createTask(taskData)

    res.status(201).json({
      status: "success",
      message: "Task created successfully",
      data: { task },
    })
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    })
  }
}

// Update task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    const updates = req.body

    const task = await taskService.updateTask(id, userId, updates)

    if (!task) {
      return res.status(404).json({
        status: "error",
        message: "Task not found",
      })
    }

    res.status(200).json({
      status: "success",
      message: "Task updated successfully",
      data: { task },
    })
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    })
  }
}

// Delete task (soft delete)
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const task = await taskService.deleteTask(id, userId)

    if (!task) {
      return res.status(404).json({
        status: "error",
        message: "Task not found",
      })
    }

    res.status(200).json({
      status: "success",
      message: "Task deleted successfully",
    })
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    })
  }
}

// Get task statistics
const getTaskStats = async (req, res) => {
  try {
    const userId = req.user.id
    const stats = await taskService.getTaskStats(userId)

    res.status(200).json({
      status: "success",
      data: { stats },
    })
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    })
  }
}

// Bulk operations
const bulkUpdateTasks = async (req, res) => {
  try {
    const userId = req.user.id
    const { taskIds, updates } = req.body

    const result = await taskService.bulkUpdateTasks(taskIds, userId, updates)

    res.status(200).json({
      status: "success",
      message: `${result.modifiedCount} tasks updated successfully`,
      data: result,
    })
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    })
  }
}

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
  bulkUpdateTasks,
}
