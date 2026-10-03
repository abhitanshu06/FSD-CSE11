function StudentForm({ formData, onChange, onSubmit, onCancel, editingId, errors, isSubmitting }) {
  return (
    <form className="student-form" onSubmit={onSubmit}>
      <div className="form-grid">
        <div className="field-group">
          <label htmlFor="id">Student ID</label>
          <input
            id="id"
            name="id"
            type="number"
            value={formData.id}
            onChange={onChange}
            placeholder="101"
          />
          {errors.id && <small className="error-text">{errors.id}</small>}
        </div>

        <div className="field-group">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={onChange}
            placeholder="Student name"
          />
          {errors.name && <small className="error-text">{errors.name}</small>}
        </div>

        <div className="field-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={onChange}
            placeholder="student@gmail.com"
          />
          {errors.email && <small className="error-text">{errors.email}</small>}
        </div>

        <div className="field-group">
          <label htmlFor="branch">Branch</label>
          <select id="branch" name="branch" value={formData.branch} onChange={onChange}>
            <option value="">Select branch</option>
            <option value="CSE">CSE</option>
            <option value="CS">CS</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
          </select>
          {errors.branch && <small className="error-text">{errors.branch}</small>}
        </div>

        <div className="field-group">
          <label htmlFor="semester">Semester</label>
          <select id="semester" name="semester" value={formData.semester} onChange={onChange}>
            <option value="">Select semester</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          {errors.semester && <small className="error-text">{errors.semester}</small>}
        </div>

        <div className="field-group">
          <label htmlFor="mobile">Mobile Number</label>
          <input
            id="mobile"
            name="mobile"
            type="text"
            value={formData.mobile}
            onChange={onChange}
            placeholder="9876543210"
            maxLength={10}
          />
          {errors.mobile && <small className="error-text">{errors.mobile}</small>}
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="primary-btn">
          {isSubmitting ? 'Please wait...' : editingId !== null ? 'Update Student' : 'Add Student'}
        </button>

        {editingId !== null && (
          <button type="button" className="secondary-btn" onClick={onCancel}>
            Cancel Edit
          </button>
        )}
      </div>
    </form>
  );
}

export default StudentForm;
