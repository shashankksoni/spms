const express = require('express');
const router = express.Router();
const Student = require('../models/student');
const { fetchAndUpdateStudentCFData } = require('../services/codeforcesService');

// GET all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new student
router.post('/', async (req, res) => {
  const { name, email, phone, cfHandle } = req.body;

  if (!name || !email || !cfHandle) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const newStudent = new Student({ name, email, phone, cfHandle });
    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE student
router.put('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const wasHandleChanged = student.cfHandle !== req.body.cfHandle;

    // Update student fields
    student.name = req.body.name || student.name;
    student.email = req.body.email || student.email;
    student.phone = req.body.phone || student.phone;
    student.cfHandle = req.body.cfHandle || student.cfHandle;

    await student.save();

    if (wasHandleChanged) {
      // Re-fetch data from Codeforces if handle changed
      await fetchAndUpdateStudentCFData(student);
    }

    res.json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE student
router.delete('/:id', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET a single student by ID
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(400).json({ error: 'Invalid student ID' });
  }
});

module.exports = router;
