import { useEffect, useState } from 'react';
import SearchStudent from './components/SearchStudent';
import StudentForm from './components/StudentForm';
import StudentList from './components/StudentList';

const initialForm = {
  id: '',
  name: '',
  email: '',
  branch: '',
  semester: '',
  mobile: '',
};

const validBranches = ['CSE', 'CS', 'IT', 'ECE'];

function App() {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getStudents();
  }, []);

  function showSuccess(message) {
    setSuccessMessage(message);
    setErrorMessage('');
    setTimeout(() => setSuccessMessage(''), 3000);
  }

  function showError(message) {
    setErrorMessage(message);
    setSuccessMessage('');
    setTimeout(() => setErrorMessage(''), 4000);
  }

  async function getStudents() {
    setLoading(true);
    try {
      const response = await fetch('/api/students');
      if (!response.ok) {
        throw new Error('Unable to fetch students');
      }
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      showError('Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  }

  function validateStudentForm(data) {
    const errors = {};

    if (!data.id || data.id === '') {
      errors.id = 'Student ID is required';
    } else if (!Number.isInteger(Number(data.id)) || Number(data.id) <= 0) {
      errors.id = 'Student ID must be a valid positive number';
    }

    if (!data.name || !String(data.name).trim()) {
      errors.name = 'Name is required';
    }

    if (!data.email || !String(data.email).trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email).trim())) {
      errors.email = 'Invalid email format';
    }

    if (!data.branch || !validBranches.includes(data.branch)) {
      errors.branch = 'Invalid branch';
    }

    if (!data.semester || data.semester === '') {
      errors.semester = 'Semester is required';
    } else if (!Number.isInteger(Number(data.semester)) || Number(data.semester) < 1 || Number(data.semester) > 8) {
      errors.semester = 'Semester must be between 1 and 8';
    }

    if (!data.mobile || !String(data.mobile).trim()) {
      errors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(String(data.mobile).trim())) {
      errors.mobile = 'Mobile number must contain exactly 10 digits';
    }

    return errors;
  }

  function resetForm() {
    setFormData(initialForm);
    setEditingId(null);
    setFieldErrors({});
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validateStudentForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setErrorMessage('Please fix the highlighted fields.');
      return;
    }

    const payload = {
      id: Number(formData.id),
      name: formData.name.trim(),
      email: formData.email.trim(),
      branch: formData.branch,
      semester: Number(formData.semester),
      mobile: formData.mobile.trim(),
    };

    setIsSubmitting(true);

    try {
      const url = editingId !== null ? `/api/students/${editingId}` : '/api/students';
      const method = editingId !== null ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Request failed');
      }

      if (editingId !== null) {
        const updatedStudent = result.student;
        setStudents((prev) =>
          prev.map((student) => (student.id === editingId ? updatedStudent : student))
        );
        showSuccess('Student updated successfully');
      } else {
        setStudents((prev) => [...prev, result.student]);
        showSuccess('Student added successfully');
      }

      resetForm();
    } catch (error) {
      showError(error.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(studentId) {
    const confirmed = window.confirm('Are you sure you want to delete this student?');

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Delete failed');
      }

      setStudents((prev) => prev.filter((student) => student.id !== studentId));
      if (editingId === studentId) {
        resetForm();
      }
      showSuccess('Student deleted successfully');
    } catch (error) {
      showError(error.message || 'Unable to delete student');
    }
  }

  function handleEdit(student) {
    setEditingId(student.id);
    setFormData({
      id: String(student.id),
      name: student.name,
      email: student.email,
      branch: student.branch,
      semester: String(student.semester),
      mobile: student.mobile,
    });
    setFieldErrors({});
    setErrorMessage('');
    setSuccessMessage('');
  }

  const filteredStudents = students.filter((student) => {
    const searchValue = searchTerm.trim().toLowerCase();
    if (!searchValue) return true;

    return (
      String(student.id).includes(searchValue) ||
      student.name.toLowerCase().includes(searchValue)
    );
  });

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">College Dashboard</p>
          <h1>STUDENT MANAGEMENT SYSTEM</h1>
        </div>
        <p className="subtitle">Manage student records</p>
      </header>

      <main className="main-content">
        <section className="card panel">
          <SearchStudent value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
        </section>

        <section className="card panel">
          <StudentForm
            formData={formData}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={resetForm}
            editingId={editingId}
            errors={fieldErrors}
            isSubmitting={isSubmitting}
          />
        </section>

        {successMessage && <div className="notification success">✓ {successMessage}</div>}
        {errorMessage && <div className="notification error">✕ {errorMessage}</div>}

        <section className="card panel">
          <div className="table-header">
            <h2>Student Records</h2>
            <span>{filteredStudents.length} records</span>
          </div>

          {loading ? (
            <p className="status-text">Loading students...</p>
          ) : filteredStudents.length === 0 ? (
            <p className="status-text">No student found</p>
          ) : (
            <StudentList students={filteredStudents} onEdit={handleEdit} onDelete={handleDelete} />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
