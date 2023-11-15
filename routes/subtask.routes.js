const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const List = require("../models/list.model");
const Task = require("../models/task.model");
const Subtask = require("../models/subtask.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

// POST - /subtask/:taskId - Create a new subtask linked to a specific task
router.post("/:taskId", isAuthenticated, async (req, res) => {
  try {
    const userId = req.payload._id;

    // Obtén el listId del parámetro de la URL
    const taskId = req.params.taskId;

    // Crea una nueva subtask vinculada a la tarea especificada
    const newSubtask = await Subtask.create({ ...req.body, task: taskId });

    const task = await Task.findByIdAndUpdate(
      taskId,
      { $push: { subtasks: newSubtask._id } },
      { new: true }
    );
    console.log(task);
    res.status(201).json(newSubtask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET - /subtask/:taskId - Get all subtasks for a specific task and user
router.get("/:taskId", isAuthenticated, async (req, res) => {
  try {
    const userId = req.payload._id;
    const taskId = req.params.taskId;
    const subtaskId = req.params.id;

    // Find the Task and populate the 'subtask' field
    const taskWithSubtasks = await Task.findById(taskId).populate("subtasks");
    console.log(taskWithSubtasks);

    // Check if the subtask exists
    if (!taskWithSubtasks) {
      return res.status(404).json({ error: "Subtask not found" });
    }
    //todo check if list belongs to the user
    // Extract the tasks from the list object
    const subtasks = taskWithSubtasks.subtasks;
    res.json(subtasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//GET - /subtask/:taskId/:subtaskid -  Get a specific subtask by ID from a specific task
router.get("/:taskId/:subtaskid", isAuthenticated, async (req, res) => {
  try {
    const userId = req.payload._id;
    const taskId = req.params.taskId;

    // Find List and populate the 'tasks' field
    const taskWithSubtasks = await Task.findById(taskId).populate("subtasks");
    console.log(taskWithSubtasks);

    // Check if the task exists
    if (!taskWithSubtasks) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Find the specific Subtask within the task's subtasks
    const subtask = taskWithSubtasks.subtasks.find(
      (subtask) => subtask._id.toString() === req.params.subtaskid
    );

    if (!subtask) {
      return res.status(404).json({ error: "Subtask not found" });
    }
    res.json(subtask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//PUT - /subtask/:subtaskid Update a specific subtask by ID
router.put("/:subtaskid", isAuthenticated, async (req, res) => {
  try {
    const updatedSubtask = await Subtask.findByIdAndUpdate(
      req.params.subtaskid,
      req.body,
      { new: true }
    );
    if (!updatedSubtask) {
      return res.status(404).json({ error: "Subtask not found" });
    }
    res.json(updatedSubtask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//DELETE - /subtask/:subtaskid Delete a specific subtask by ID
router.delete("/:subtaskid", isAuthenticated, async (req, res) => {
  try {
    const deletedSubtask = await Subtask.findByIdAndDelete(req.params.subtaskid);

    if (!deletedSubtask) {
      return res.status(404).json({ error: "Subtask not found" });
    }

    // Remove the reference to the deleted subtask from the associated task
    const taskId = deletedSubtask.task;
    await Task.findByIdAndUpdate(
      taskId,
      { $pull: { subtasks: req.params.subtaskid } },
      { new: true }
    );

    res.json({ message: "Subtask deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
