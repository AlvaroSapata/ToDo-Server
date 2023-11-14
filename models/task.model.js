const { Schema, model } = require("mongoose");

const taskSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  dueDate: {
    type: Date,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  subtasks: [{ type: Schema.Types.ObjectId, ref: "Subtask" }],
  default:[],
});

const Task = model("Task", taskSchema);

module.exports = Task;
