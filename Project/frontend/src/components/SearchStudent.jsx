function SearchStudent({ value, onChange }) {
  return (
    <div className="search-box">
      <label htmlFor="search">Search by Student ID or Name</label>
      <input
        id="search"
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Search student..."
      />
    </div>
  );
}

export default SearchStudent;
