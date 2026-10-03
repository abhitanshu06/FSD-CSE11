# Student Management System

## Project Description

This project is a full-stack Student Management System built using React.js on the frontend and Node.js + Express.js on the backend. It allows users to add, view, search, update, and delete student records using REST APIs. The data is stored temporarily in the server's in-memory array, so it resets when the backend server restarts.

## Technologies Used

### Frontend
- React.js
- JavaScript
- HTML
- CSS

### Backend
- Node.js
- Express.js

### Communication
- Fetch API

### Storage
- In-memory JavaScript array

## Features

- Add student
- View all students
- Search students by name or ID
- Update student details
- Delete student records
- Frontend and backend validation
- Success and error notifications
- Responsive design

## Project Structure

student-management/
├── backend/
│   ├── routes/
│   │   └── studentRoutes.js
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SearchStudent.jsx
│   │   │   ├── StudentForm.jsx
│   │   │   └── StudentList.jsx
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── ...
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── screenshots/
├── .gitignore
├── README.md
└── ...

## Installation

Open two terminals.

### Backend

```bash
cd student-management/backend
npm install
```

### Frontend

```bash
cd student-management/frontend
npm install
```

## Running the Backend

```bash
cd student-management/backend
npm start
```

The backend server runs on:

```text
http://localhost:5000
```

## Running the Frontend

```bash
cd student-management/frontend
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

## API Documentation

### GET /api/students

Returns all students.

### GET /api/students/:id

Returns one student by student ID.

### POST /api/students

Adds a new student.

Example request body:

```json
{
  "id": 103,
  "name": "Priya Singh",
  "email": "priya@gmail.com",
  "branch": "CSE",
  "semester": 4,
  "mobile": "9988776655"
}
```

### PUT /api/students/:id

Updates an existing student.

### DELETE /api/students/:id

Deletes a student by student ID.

## Important Note

This application uses in-memory storage only. All data is kept in the Node.js server memory and will reset when the backend server restarts.
