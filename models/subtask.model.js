const { Schema, model } = require("mongoose");

const subtaskSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

const Subtask = model("Subtask", subtaskSchema);

module.exports = Subtask;
