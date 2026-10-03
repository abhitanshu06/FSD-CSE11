const express = require('express');
const router = express.Router();

let students = [
  {
    id: 101,
    name: 'Rahul Sharma',
    email: 'rahul@gmail.com',
    branch: 'CSE',
    semester: 3,
    mobile: '9876543210',
  },
  {
    id: 102,
    name: 'Ananya Verma',
    email: 'ananya@gmail.com',
    branch: 'IT',
    semester: 5,
    mobile: '9123456780',
  },
];

const VALID_BRANCHES = ['CSE', 'CS', 'IT', 'ECE'];

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateStudent(student) {
  const errors = {};

  if (student.id === undefined || student.id === null || student.id === '') {
    errors.id = 'Student ID is required';
  } else if (!Number.isInteger(Number(student.id)) || Number(student.id) <= 0) {
    errors.id = 'Student ID must be a valid positive number';
  }

  if (!student.name || !String(student.name).trim()) {
    errors.name = 'Name is required';
  }

  if (!student.email || !String(student.email).trim()) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(String(student.email).trim())) {
    errors.email = 'Invalid email format';
  }

  if (!student.branch || !VALID_BRANCHES.includes(student.branch)) {
    errors.branch = 'Invalid branch';
  }

  if (student.semester === undefined || student.semester === null || student.semester === '') {
    errors.semester = 'Semester is required';
  } else if (!Number.isInteger(Number(student.semester)) || Number(student.semester) < 1 || Number(student.semester) > 8) {
    errors.semester = 'Semester must be between 1 and 8';
  }

  if (!student.mobile || !String(student.mobile).trim()) {
    errors.mobile = 'Mobile number is required';
  } else if (!/^\d{10}$/.test(String(student.mobile).trim())) {
    errors.mobile = 'Mobile number must contain exactly 10 digits';
  }

  return errors;
}

router.get('/students', (req, res) => {
  res.status(200).json(students);
});

router.get('/students/:id', (req, res) => {
  const studentId = Number(req.params.id);
  const student = students.find((item) => item.id === studentId);

  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  return res.status(200).json(student);
});

router.post('/students', (req, res) => {
  const student = req.body;
  const validationErrors = validateStudent(student);

  if (Object.keys(validationErrors).length > 0) {
    return res.status(400).json({
      message: validationErrors[Object.keys(validationErrors)[0]],
      errors: validationErrors,
    });
  }

  const studentId = Number(student.id);

  if (students.some((item) => item.id === studentId)) {
    return res.status(409).json({ message: 'Student ID already exists' });
  }

  const newStudent = {
    id: studentId,
    name: String(student.name).trim(),
    email: String(student.email).trim(),
    branch: student.branch,
    semester: Number(student.semester),
    mobile: String(student.mobile).trim(),
  };

  students.push(newStudent);

  return res.status(201).json({
    message: 'Student added successfully',
    student: newStudent,
  });
});

router.put('/students/:id', (req, res) => {
  const targetId = Number(req.params.id);
  const index = students.findIndex((item) => item.id === targetId);

  if (index === -1) {
    return res.status(404).json({ message: 'Student not found' });
  }

  const updatedData = {
    ...students[index],
    ...req.body,
  };

  const validationErrors = validateStudent(updatedData);

  if (Object.keys(validationErrors).length > 0) {
    return res.status(400).json({
      message: validationErrors[Object.keys(validationErrors)[0]],
      errors: validationErrors,
    });
  }

  const newId = Number(updatedData.id);
  const duplicateStudent = students.find((item) => item.id === newId && item.id !== targetId);

  if (duplicateStudent) {
    return res.status(409).json({ message: 'Student ID already exists' });
  }

  const finalStudent = {
    id: newId,
    name: String(updatedData.name).trim(),
    email: String(updatedData.email).trim(),
    branch: updatedData.branch,
    semester: Number(updatedData.semester),
    mobile: String(updatedData.mobile).trim(),
  };

  students[index] = finalStudent;

  return res.status(200).json({
    message: 'Student updated successfully',
    student: finalStudent,
  });
});

router.delete('/students/:id', (req, res) => {
  const studentId = Number(req.params.id);
  const index = students.findIndex((item) => item.id === studentId);

  if (index === -1) {
    return res.status(404).json({ message: 'Student not found' });
  }

  students.splice(index, 1);

  return res.status(200).json({
    message: 'Student deleted successfully',
  });
});

module.exports = router;
