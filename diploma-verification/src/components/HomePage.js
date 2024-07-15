import React from 'react';

function HomePage({ setCurrentPage }) {
    return (
        <div className='HomePage'>
            <h1>Welcome to the Education Platform</h1>
            <button onClick={() => setCurrentPage('login')}>Login with MetaMask</button>
            <button onClick={() => setCurrentPage('register')}>Register</button>
        </div>
    );
}

export default HomePage;
