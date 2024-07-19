import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage'; // Adjust the import paths as needed
import DataPage from './pages/DataPage';
import ProtectedRoute from './Components/ProtectedRoute';

function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={
            <ProtectedRoute>
              <DataPage />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
  );
}

export default App;




