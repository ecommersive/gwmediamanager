import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, Navigate } from 'react-router-dom';  
function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsAuthenticated(false);
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/verifyToken`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setIsAuthenticated(response.data);
            } catch (error) {
                console.error('Token verification failed:', error);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, []);

    return { isAuthenticated, loading };
}

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }
    return children;
};

export default ProtectedRoute;
