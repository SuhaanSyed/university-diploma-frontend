import React, { useState } from 'react';
import './assets/styles/App.css';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboards/Dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [role, setRole] = useState('');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <div className='App'>
            <div className='app-header'>
              <h1>Home Page</h1>
              <button onClick={() => setCurrentPage('login')}>Login</button>
              <button onClick={() => setCurrentPage('register')}>Register</button>
            </div>
          </div>
        );
      case 'login':
        return <Login setCurrentPage={setCurrentPage} setRole={setRole} />;
      case 'register':
        return <Register setCurrentPage={setCurrentPage} setRole={setRole} />;
      case 'studentDashboard':
      case 'collegeDashboard':
      case 'companyDashboard':
        return <Dashboard role={role} />;
      default:
        return <div>404 Page Not Found</div>;
    }
  };

  return <div className='App'>{renderPage()}</div>;
}

export default App;
