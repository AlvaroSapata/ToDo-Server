// Import necessary modules
const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const List = require("../models/list.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

// POST - /list - Create a new list linked to the user
router.post("/", isAuthenticated, async (req, res) => {
  try {
    // Get user Id from payload
    const userId = req.payload._id;

    // Create a new list with the user ID
    const newList = await List.create({ ...req.body, user: userId });

    // Add the new list to the user's lists
    const user = await User.findByIdAndUpdate(
      userId,
      { $push: { list: newList._id } },
      { new: true }
    );
    res.status(201).json(newList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET - /list - Get lists of the authenticated user
router.get("/", isAuthenticated, async (req, res) => {
  try {
    // Get user Id from payload
    const userId = req.payload._id;

    // Find user and populate the 'list' field
    const userWithLists = await User.findById(userId).populate("list");

    // Extract the lists from the user object
    const lists = userWithLists.list;

    res.json(lists);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//GET - /list/:listId - Get a specific list by ID
router.get("/:listId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.payload._id;
  
      // Find the list by ID and check if it belongs to the authenticated user
      const list = await List.findById({ _id: req.params.listId, user: userId }).populate("tasks");
      
      if (!list) {
        return res.status(404).json({ error: "List not found" });
      }
      
      res.json(list);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  //PUT - /list/:listId - Update a specific list by ID
  router.put("/:listId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.payload._id;
  
      // Find the list by ID and check if it belongs to the authenticated user
      const updatedList = await List.findByIdAndUpdate(
        { _id: req.params.listId, user: userId },
        req.body,
        { new: true }
      );
  
      if (!updatedList) {
        return res.status(404).json({ error: "List not found" });
      }
  
      res.json(updatedList);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
 // DELETE - /list/:listId - Delete a specific list by ID
router.delete("/:listId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.payload._id;
  
      // Find the list by ID and check if it belongs to the authenticated user
      const deletedList = await List.findByIdAndDelete({ _id: req.params.listId, user: userId });
  
      if (!deletedList) {
        return res.status(404).json({ error: "List not found" });
      }
  
      // Remove the reference to the deleted list from the user's lists
      await User.findByIdAndUpdate(
        userId,
        { $pull: { list: req.params.listId } },
        { new: true }
      );
  
      res.json({ message: "List deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  

module.exports = router;
