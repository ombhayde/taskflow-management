const mongoose = require("mongoose")

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    userId: {
      type: Number,
      required: [true, "User ID is required"],
      index: true,
    },
    dueDate: {
      type: Date,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Indexes for better performance
taskSchema.index({ userId: 1, status: 1 })
taskSchema.index({ userId: 1, createdAt: -1 })
taskSchema.index({ userId: 1, isDeleted: 1 })
taskSchema.index({ title: "text", description: "text" })

// Virtual for overdue status
taskSchema.virtual("isOverdue").get(function () {
  return this.dueDate && this.dueDate < new Date() && this.status !== "completed"
})

// Soft delete middleware
taskSchema.pre(/^find/, function () {
  this.find({ isDeleted: { $ne: true } })
})

module.exports = mongoose.model("Task", taskSchema)
