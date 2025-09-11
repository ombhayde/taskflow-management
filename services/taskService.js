const Task = require("../models/Task")

class TaskService {
  async createTask(taskData) {
    const task = new Task(taskData)
    return await task.save()
  }

  async getUserTasks(userId, options = {}) {
    const { page = 1, limit = 10, status, sortBy = "createdAt", sortOrder = "desc" } = options

    const filter = { userId, isDeleted: false }
    if (status) {
      filter.status = status
    }

    const sort = {}
    sort[sortBy] = sortOrder === "desc" ? -1 : 1

    const skip = (page - 1) * limit

    const [tasks, total] = await Promise.all([
      Task.find(filter).sort(sort).skip(skip).limit(limit),
      Task.countDocuments(filter),
    ])

    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return {
      tasks,
      pagination: {
        currentPage: page,
        totalPages,
        totalTasks: total,
        hasNextPage,
        hasPrevPage,
        limit,
      },
    }
  }

  async getTaskById(taskId, userId) {
    return await Task.findOne({
      _id: taskId,
      userId,
      isDeleted: false,
    })
  }

  async updateTask(taskId, userId, updateData) {
    const task = await Task.findOneAndUpdate(
      {
        _id: taskId,
        userId,
        isDeleted: false,
      },
      updateData,
      {
        new: true,
        runValidators: true,
      },
    )

    return task
  }

  async deleteTask(taskId, userId) {
    const task = await Task.findOne({
      _id: taskId,
      userId,
      isDeleted: false,
    })

    if (!task) {
      return false
    }

    await task.softDelete()
    return true
  }

  async searchTasks(userId, query, options = {}) {
    const { page = 1, limit = 10 } = options

    const filter = {
      userId,
      isDeleted: false,
      $text: { $search: query },
    }

    const skip = (page - 1) * limit

    const [tasks, total] = await Promise.all([
      Task.find(filter, { score: { $meta: "textScore" } })
        .sort({ score: { $meta: "textScore" }, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Task.countDocuments(filter),
    ])

    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return {
      tasks,
      query,
      pagination: {
        currentPage: page,
        totalPages,
        totalTasks: total,
        hasNextPage,
        hasPrevPage,
        limit,
      },
    }
  }

  async getTaskStats(userId) {
    const stats = await Task.aggregate([
      {
        $match: {
          userId,
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ])

    const result = {
      todo: 0,
      "in-progress": 0,
      done: 0,
      total: 0,
    }

    stats.forEach((stat) => {
      result[stat._id] = stat.count
      result.total += stat.count
    })

    return result
  }

  async getTasksByDateRange(userId, options = {}) {
    const { page = 1, limit = 10, startDate, endDate } = options

    const filter = {
      userId,
      isDeleted: false,
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    }

    const skip = (page - 1) * limit

    const [tasks, total] = await Promise.all([
      Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Task.countDocuments(filter),
    ])

    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return {
      tasks,
      dateRange: { startDate, endDate },
      pagination: {
        currentPage: page,
        totalPages,
        totalTasks: total,
        hasNextPage,
        hasPrevPage,
        limit,
      },
    }
  }

  async bulkUpdateTasks(userId, taskIds, updateData) {
    const result = await Task.updateMany(
      {
        _id: { $in: taskIds },
        userId,
        isDeleted: false,
      },
      updateData,
      {
        runValidators: true,
      },
    )

    return result
  }

  async bulkDeleteTasks(userId, taskIds) {
    const result = await Task.updateMany(
      {
        _id: { $in: taskIds },
        userId,
        isDeleted: false,
      },
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
    )

    return result
  }

  async duplicateTask(taskId, userId) {
    const originalTask = await Task.findOne({
      _id: taskId,
      userId,
      isDeleted: false,
    })

    if (!originalTask) {
      return null
    }

    const duplicatedTaskData = {
      userId: originalTask.userId,
      title: `${originalTask.title} (Copy)`,
      description: originalTask.description,
      status: "todo", 
    }

    const duplicatedTask = new Task(duplicatedTaskData)
    return await duplicatedTask.save()
  }

  async getDeletedTasks(userId, options = {}) {
    const { page = 1, limit = 10 } = options

    const filter = {
      userId,
      isDeleted: true,
    }

    const skip = (page - 1) * limit

    const [tasks, total] = await Promise.all([
      Task.find(filter).sort({ deletedAt: -1 }).skip(skip).limit(limit),
      Task.countDocuments(filter),
    ])

    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return {
      tasks,
      pagination: {
        currentPage: page,
        totalPages,
        totalTasks: total,
        hasNextPage,
        hasPrevPage,
        limit,
      },
    }
  }

  async restoreTask(taskId, userId) {
    const task = await Task.findOneAndUpdate(
      {
        _id: taskId,
        userId,
        isDeleted: true,
      },
      {
        isDeleted: false,
        deletedAt: null,
      },
      {
        new: true,
      },
    )

    return task
  }

  async getAdvancedTaskStats(userId) {
    const stats = await Task.aggregate([
      {
        $match: {
          userId,
          isDeleted: false,
        },
      },
      {
        $facet: {
          statusStats: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
              },
            },
          ],
          monthlyStats: [
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" },
                },
                count: { $sum: 1 },
              },
            },
            {
              $sort: { "_id.year": -1, "_id.month": -1 },
            },
            {
              $limit: 12,
            },
          ],
          recentActivity: [
            {
              $sort: { updatedAt: -1 },
            },
            {
              $limit: 5,
            },
            {
              $project: {
                title: 1,
                status: 1,
                updatedAt: 1,
              },
            },
          ],
        },
      },
    ])

    return stats[0]
  }
}

module.exports = new TaskService()
