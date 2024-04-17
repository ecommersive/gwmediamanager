import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

function useAuth() {
    const token = localStorage.getItem('token');
    const isAuthenticated = token ? true : false;
    // send endpoint to server to verify token
    return { isAuthenticated };
}

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();
    console.log('location', location);

    if (!isAuthenticated) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
