const Task = require("../models/Task")

class TaskService {
  // Get tasks with filtering, pagination, and search
  async getTasks(userId, options = {}) {
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
    } = options

    // Build filter query
    const filter = { userId }

    if (status) {
      filter.status = status
    }

    if (priority) {
      filter.priority = priority
    }

    if (search) {
      filter.$text = { $search: search }
    }

    if (startDate || endDate) {
      filter.createdAt = {}
      if (startDate) filter.createdAt.$gte = new Date(startDate)
      if (endDate) filter.createdAt.$lte = new Date(endDate)
    }

    // Build sort object
    const sort = {}
    sort[sortBy] = sortOrder === "desc" ? -1 : 1

    // Calculate pagination
    const skip = (page - 1) * limit

    // Execute queries
    const [tasks, total] = await Promise.all([
      Task.find(filter).sort(sort).skip(skip).limit(Number.parseInt(limit)).lean(),
      Task.countDocuments(filter),
    ])

    return {
      tasks,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalTasks: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    }
  }

  // Create new task
  async createTask(taskData) {
    const task = new Task(taskData)
    await task.save()
    return task
  }

  // Update task
  async updateTask(taskId, userId, updates) {
    const task = await Task.findOneAndUpdate({ _id: taskId, userId }, updates, { new: true, runValidators: true })
    return task
  }

  // Soft delete task
  async deleteTask(taskId, userId) {
    const task = await Task.findOneAndUpdate(
      { _id: taskId, userId },
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true },
    )
    return task
  }

  // Get task statistics
  async getTaskStats(userId) {
    const stats = await Task.aggregate([
      { $match: { userId, isDeleted: { $ne: true } } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] },
          },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [{ $lt: ["$dueDate", new Date()] }, { $ne: ["$status", "completed"] }],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ])

    return (
      stats[0] || {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        overdue: 0,
      }
    )
  }

  // Bulk update tasks
  async bulkUpdateTasks(taskIds, userId, updates) {
    const result = await Task.updateMany({ _id: { $in: taskIds }, userId }, updates, { runValidators: true })
    return result
  }
}

module.exports = new TaskService()
