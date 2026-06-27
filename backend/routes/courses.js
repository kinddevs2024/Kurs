const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const path = require('path');

// GET /api/courses - list all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/courses/:id - get single course details
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// GET /api/courses/:id/slides - list slide filenames
router.get('/:id/slides', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    
    // For Vercel Serverless compatibility, we generate the array based on slidesCount
    // because reading the 1.2GB directory is not possible in a 250MB serverless function.
    const count = course.slidesCount || 10;
    const files = [];
    for (let i = 1; i <= count; i++) {
      const num = i.toString().padStart(2, '0');
      files.push(`slide-${num}.png`);
    }
    
    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Serve slide images for a course
router.get('/:id/slides/:filename', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const filename = req.params.filename;
    const slidesDir = path.join(__dirname, '..', '..', 'generated-slides');
    const filePath = path.join(slidesDir, course.slug || req.params.id, filename);
    
    res.sendFile(filePath, err => {
      if (err) {
        res.status(404).json({ error: 'Slide not found' });
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
