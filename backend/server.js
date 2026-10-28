const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const Student = require("./models/Student");

const app = express();

// Middleware to read JSON request bodies
app.use(express.json());

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    message: "Student Records API is running"
  });
});

// Get all students
app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get one student by ID
app.get("/api/students/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create a student
app.post("/api/students", async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (error) {
    if (error.name === "ValidationError" ||
        error.name === "StrictModeError" ||
        error.name === "CastError") {
      return res.status(400).json({ message: "Invalid student data" });
    }

    res.status(500).json({ message: "Server error" });
  }
});

// Update a student
app.put("/api/students/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
        strict: "throw"
      }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(student);
  } catch (error) {
    if (error.name === "ValidationError" ||
        error.name === "StrictModeError" ||
        error.name === "CastError") {
      return res.status(400).json({ message: "Invalid student data" });
    }

    res.status(500).json({ message: "Server error" });
  }
});

// Delete a student
app.delete("/api/students/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({
      message: "Student deleted successfully",
      student
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Connect to MongoDB before starting the server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
