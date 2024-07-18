import React from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import StudentDashboard from './StudentDashboard';
import CollegeDashboard from './CollegeDashboard';
import CompanyDashboard from './CompanyDashboard';

function Dashboard() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    if (!token) {
        navigate('/login');
        return null;
    }

    const decodedToken = jwtDecode(token);
    const userRole = decodedToken.role;

    switch (userRole) {
        case 'student':
            return <StudentDashboard />;
        case 'college':
            return <CollegeDashboard />;
        case 'company':
            return <CompanyDashboard />;
        default:
            return <div>Invalid user role</div>;
    }
}

export default Dashboard;
