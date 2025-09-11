const mongoose = require("mongoose")

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v
        return ret
      },
    },
  },
)

taskSchema.index({ userId: 1, status: 1 })
taskSchema.index({ userId: 1, isDeleted: 1 })
taskSchema.index({ userId: 1, title: "text", description: "text" })

taskSchema.methods.softDelete = function () {
  this.isDeleted = true
  this.deletedAt = new Date()
  return this.save()
}

taskSchema.statics.findActive = function (filter = {}) {
  return this.find({ ...filter, isDeleted: false })
}

taskSchema.statics.findByUser = function (userId, filter = {}) {
  return this.findActive({ ...filter, userId })
}

taskSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.title = this.title.trim()
  }
  if (this.isModified("description") && this.description) {
    this.description = this.description.trim()
  }
  next()
})

module.exports = mongoose.model("Task", taskSchema)
