const express = require('express');
const router = express.Router();
const Student = require('../models/student');

// GET all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find();
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

// PUT update student
router.put('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const updated = await Student.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
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

module.exports = router;
