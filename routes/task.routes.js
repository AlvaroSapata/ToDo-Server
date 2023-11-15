const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const List = require("../models/list.model");
const Task = require("../models/task.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

// POST - /task/:listId - Create a new task linked to a specific list
router.post("/:listId", isAuthenticated, async (req, res) => {
  try {
    const userId = req.payload._id;

    // Obtén el listId del parámetro de la URL
    const listId = req.params.listId;

    // Asegúrate de que el listId esté asociado al usuario autenticado
    const userWithList = await User.findById({ _id: userId, list: listId });

    if (!userWithList) {
      return res
        .status(403)
        .json({ error: "Unauthorized - List does not belong to the user" });
    }

    // Crea una nueva tarea vinculada a la lista especificada
    const newTask = await Task.create({ ...req.body, list: listId });

    const list = await List.findByIdAndUpdate(
      listId,
      { $push: { tasks: newTask._id } },
      { new: true }
    );
    console.log(list);
    res.status(201).json(newTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET - /task/:listId - Get all tasks for a specific list and user
router.get("/:listId", isAuthenticated, async (req, res) => {
  try {
    const userId = req.payload._id; // Obtener el ID del usuario autenticado
    const listId = req.params.listId;

    // Find List and populate the 'tasks' field
    const listWithTasks = await List.findById(listId).populate("tasks");

    // Check if the list exists
    if (!listWithTasks) {
      return res.status(404).json({ error: "List not found" });
    }
    //todo check if list belongs to the user
    // Extract the tasks from the list object
    const tasks = listWithTasks.tasks;

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//GET - /task/:listId/:taskid -  Get a specific task by ID from a specific list
router.get("/:listId/:taskid", isAuthenticated, async (req, res) => {
  try {
    const userId = req.payload._id;
    const listId = req.params.listId;

    // Find List and populate the 'tasks' field
    const listWithTasks = await List.findById(listId).populate("tasks");

    // Check if the list exists
    if (!listWithTasks) {
      return res.status(404).json({ error: "List not found" });
    }

    // Find the specific task within the list's tasks
    const task = listWithTasks.tasks.find(
      (task) => task._id.toString() === req.params.taskid
    );

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//PUT - /task/:taskid -  Update a specific task by ID
router.put("/:taskid", isAuthenticated, async (req, res) => {
    try {
      const userId = req.payload._id;
      const taskId = req.params.taskid;
  
      // Check if the task exists and belongs to the user
      const task = await Task.findByIdAndUpdate({ _id: taskId, user: userId });
  
      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }
  
      // Update the task
      const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        req.body,
        { new: true }
      );
  
      res.json(updatedTask);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  

// DELETE - /task/:taskid - Delete a specific task by ID
router.delete("/:taskid", isAuthenticated, async (req, res) => {
    try {
      const userId = req.payload._id;
  
      // Find the task by ID and check if it belongs to the authenticated user
      const deletedTask = await Task.findByIdAndDelete({
        _id: req.params.taskid,
        user: userId,
      });
  
      if (!deletedTask) {
        return res.status(404).json({ error: "Task not found" });
      }
  
      // Remove the reference to the deleted task from the associated list
      const listId = deletedTask.list;
      await List.findByIdAndUpdate(
        listId,
        { $pull: { tasks: req.params.taskid } },
        { new: true }
      );
  
      res.json({ message: "Task deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  

module.exports = router;
