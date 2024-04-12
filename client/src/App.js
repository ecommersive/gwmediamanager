import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage'; // Adjust the import paths as needed
import DataPage from './pages/DataPage';


function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<DataPage />} />
        </Routes>
      </Router>
  );
}

export default App;
