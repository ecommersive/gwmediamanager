import React from 'react';
import '../styles/searchinput.css';
const SearchInput = ({ searchTerm, setSearchTerm }) => {
  console.log("searchTerm ====", searchTerm);
  
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
