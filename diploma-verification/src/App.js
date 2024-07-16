import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './assets/styles/App.css';
import TestAPI from './TestApi';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboards/Dashboard';
import { AmoyProvider } from './components/Auth/AmoyContext';

function App() {
  const [role, setRole] = useState('');

  return (
    <Router>
      <AmoyProvider>
        <div className='App'>
          <div className='app-header'>
            <h1>Home Page</h1>
            <nav>
              <ul>
                <li>
                  <Link to="/login">Login</Link>
                </li>
                <li>
                  <Link to="/register">Register</Link>
                </li>
                <li>
                  <Link to="/test">TestAPI</Link>
                </li>
              </ul>
            </nav>
          </div>
          <Routes>
            <Route path="/" element={<h2>Welcome to the Home Page</h2>} />
            <Route path="/login" element={<Login setRole={setRole} />} />
            <Route path="/register" element={<Register setRole={setRole} />} />
            <Route path="/test" element={<TestAPI />} />
            <Route path="/dashboard" element={<Dashboard role={role} />} />
          </Routes>
        </div>
      </AmoyProvider>
    </Router>
  );
}

export default App;
