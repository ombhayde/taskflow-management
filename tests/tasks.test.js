const request = require("supertest")
const app = require("../server")
const Task = require("../models/Task")

describe("Task Endpoints", () => {
  let authToken
  let userId
  let taskId

  beforeAll(async () => {
    // Register and login a test user
    const registerResponse = await request(app).post("/api/auth/register").send({
      name: "Task Test User",
      email: "tasktest@example.com",
      password: "password123",
    })

    authToken = registerResponse.body.data.token
    userId = registerResponse.body.data.user.id
  })

  afterAll(async () => {
    // Clean up test data
    await Task.deleteMany({ userId })
  })

  describe("POST /api/tasks", () => {
    it("should create a new task successfully", async () => {
      const taskData = {
        title: "Test Task",
        description: "This is a test task",
        status: "todo",
      }

      const response = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .send(taskData)
        .expect(201)

      expect(response.body.status).toBe("success")
      expect(response.body.data.task.title).toBe(taskData.title)
      expect(response.body.data.task.userId).toBe(userId)

      taskId = response.body.data.task._id
    })

    it("should return error without authentication", async () => {
      const taskData = {
        title: "Test Task",
        description: "This is a test task",
      }

      const response = await request(app).post("/api/tasks").send(taskData).expect(401)

      expect(response.body.status).toBe("error")
    })

    it("should return error for invalid task data", async () => {
      const taskData = {
        description: "Task without title",
      }

      const response = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${authToken}`)
        .send(taskData)
        .expect(400)

      expect(response.body.status).toBe("error")
    })
  })

  describe("GET /api/tasks", () => {
    it("should get user tasks with pagination", async () => {
      const response = await request(app)
        .get("/api/tasks?page=1&limit=10")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.status).toBe("success")
      expect(response.body.data.tasks).toBeDefined()
      expect(response.body.data.pagination).toBeDefined()
      expect(Array.isArray(response.body.data.tasks)).toBe(true)
    })

    it("should filter tasks by status", async () => {
      const response = await request(app)
        .get("/api/tasks?status=todo")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.status).toBe("success")
      response.body.data.tasks.forEach((task) => {
        expect(task.status).toBe("todo")
      })
    })
  })

  describe("GET /api/tasks/:id", () => {
    it("should get task by ID", async () => {
      const response = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.status).toBe("success")
      expect(response.body.data.task._id).toBe(taskId)
    })

    it("should return error for non-existent task", async () => {
      const fakeId = "507f1f77bcf86cd799439011"
      const response = await request(app)
        .get(`/api/tasks/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404)

      expect(response.body.status).toBe("error")
    })
  })

  describe("PUT /api/tasks/:id", () => {
    it("should update task successfully", async () => {
      const updateData = {
        title: "Updated Test Task",
        status: "in-progress",
      }

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body.status).toBe("success")
      expect(response.body.data.task.title).toBe(updateData.title)
      expect(response.body.data.task.status).toBe(updateData.status)
    })
  })

  describe("GET /api/tasks/search", () => {
    it("should search tasks by title", async () => {
      const response = await request(app)
        .get("/api/tasks/search?q=Updated")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.status).toBe("success")
      expect(response.body.data.tasks.length).toBeGreaterThan(0)
    })

    it("should return error without search query", async () => {
      const response = await request(app)
        .get("/api/tasks/search")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(400)

      expect(response.body.status).toBe("error")
    })
  })

  describe("GET /api/tasks/stats", () => {
    it("should get task statistics", async () => {
      const response = await request(app)
        .get("/api/tasks/stats")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.status).toBe("success")
      expect(response.body.data.stats).toBeDefined()
      expect(typeof response.body.data.stats.total).toBe("number")
    })
  })

  describe("DELETE /api/tasks/:id", () => {
    it("should soft delete task successfully", async () => {
      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.status).toBe("success")
      expect(response.body.message).toContain("deleted")
    })

    it("should not find deleted task", async () => {
      const response = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404)

      expect(response.body.status).toBe("error")
    })
  })
})
