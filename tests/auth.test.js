const request = require("supertest")
const app = require("../server")
const { getConnection } = require("../config/mysql")

describe("Authentication Endpoints", () => {
  let connection

  beforeAll(async () => {
    connection = getConnection()
  })

  afterAll(async () => {
    await connection.execute("DELETE FROM users WHERE email LIKE '%test%'")
  })

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      }

      const response = await request(app).post("/api/auth/register").send(userData).expect(201)

      expect(response.body.status).toBe("success")
      expect(response.body.data.user.email).toBe(userData.email)
      expect(response.body.data.token).toBeDefined()
    })

    it("should return error for duplicate email", async () => {
      const userData = {
        name: "Test User 2",
        email: "test@example.com",
        password: "password123",
      }

      const response = await request(app).post("/api/auth/register").send(userData).expect(400)

      expect(response.body.status).toBe("error")
      expect(response.body.message).toContain("already exists")
    })

    it("should return error for invalid email", async () => {
      const userData = {
        name: "Test User",
        email: "invalid-email",
        password: "password123",
      }

      const response = await request(app).post("/api/auth/register").send(userData).expect(400)

      expect(response.body.status).toBe("error")
    })

    it("should return error for short password", async () => {
      const userData = {
        name: "Test User",
        email: "test2@example.com",
        password: "123",
      }

      const response = await request(app).post("/api/auth/register").send(userData).expect(400)

      expect(response.body.status).toBe("error")
    })
  })

  describe("POST /api/auth/login", () => {
    it("should login successfully with valid credentials", async () => {
      const loginData = {
        email: "test@example.com",
        password: "password123",
      }

      const response = await request(app).post("/api/auth/login").send(loginData).expect(200)

      expect(response.body.status).toBe("success")
      expect(response.body.data.user.email).toBe(loginData.email)
      expect(response.body.data.token).toBeDefined()
    })

    it("should return error for invalid credentials", async () => {
      const loginData = {
        email: "test@example.com",
        password: "wrongpassword",
      }

      const response = await request(app).post("/api/auth/login").send(loginData).expect(401)

      expect(response.body.status).toBe("error")
      expect(response.body.message).toContain("Invalid")
    })

    it("should return error for non-existent user", async () => {
      const loginData = {
        email: "nonexistent@example.com",
        password: "password123",
      }

      const response = await request(app).post("/api/auth/login").send(loginData).expect(401)

      expect(response.body.status).toBe("error")
    })
  })

  describe("GET /api/auth/profile", () => {
    let authToken

    beforeAll(async () => {
      const loginResponse = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "password123",
      })
      authToken = loginResponse.body.data.token
    })

    it("should get user profile with valid token", async () => {
      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.status).toBe("success")
      expect(response.body.data.user.email).toBe("test@example.com")
    })

    it("should return error without token", async () => {
      const response = await request(app).get("/api/auth/profile").expect(401)

      expect(response.body.status).toBe("error")
      expect(response.body.message).toContain("No token")
    })

    it("should return error with invalid token", async () => {
      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", "Bearer invalid-token")
        .expect(401)

      expect(response.body.status).toBe("error")
    })
  })
})
