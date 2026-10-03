function StudentList({ students, onEdit, onDelete }) {
  if (!students.length) {
    return <p className="empty-state">No students available.</p>;
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Branch</th>
            <th>Semester</th>
            <th>Mobile</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>{student.id}</td>
              <td>{student.name}</td>
              <td>{student.email}</td>
              <td>{student.branch}</td>
              <td>{student.semester}</td>
              <td>{student.mobile}</td>
              <td className="action-cell">
                <button className="edit-btn" type="button" onClick={() => onEdit(student)}>
                  Edit
                </button>
                <button className="delete-btn" type="button" onClick={() => onDelete(student.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StudentList;
