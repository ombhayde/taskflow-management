const db = db.getSiblingDB("task_management")

db.createCollection("tasks")

db.tasks.createIndex({ userId: 1, status: 1 })
db.tasks.createIndex({ userId: 1, isDeleted: 1 })
db.tasks.createIndex({ userId: 1, createdAt: -1 })
db.tasks.createIndex({ title: "text", description: "text" })

db.tasks.insertMany([
  {
    userId: 1,
    title: "Complete project documentation",
    description: "Write comprehensive documentation for the task management API",
    status: "in-progress",
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    userId: 1,
    title: "Set up CI/CD pipeline",
    description: "Configure automated testing and deployment pipeline",
    status: "todo",
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    userId: 1,
    title: "Review code changes",
    description: "Review and approve pending pull requests",
    status: "done",
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
])

print("MongoDB initialized successfully")
