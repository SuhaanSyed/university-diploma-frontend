import React from 'react';

function Dashboard({ role }) {
    return (
        <div className='Dashboard'>
            <h1>{role.charAt(0).toUpperCase() + role.slice(1)} Dashboard</h1>
            <p>Welcome to your dashboard.</p>
        </div>
    );
}

export default Dashboard;
