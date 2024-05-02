// SearchInput.js
import React from 'react';
import '../styles/searchinput.css';
const SearchInput = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="input-group">
    <input
      type="search"
      placeholder="Search Data..."
      value={searchTerm}
      onChange={e => setSearchTerm(e.target.value)}
      
    />
    </div>
  );
};

export default SearchInput;
