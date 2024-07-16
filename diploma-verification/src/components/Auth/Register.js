import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

function Register({ setCurrentPage, setRole }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { authData } = location.state;
    const [role, setRoleState] = useState('student');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [permissionCode, setPermissionCode] = useState('');
    const [walletAddress, setWalletAddress] = useState(authData.address);

    const VALID_PERMISSION_CODE = '100';

    const handleRegister = async () => {
        if ((role === 'college' || role === 'company') && permissionCode !== VALID_PERMISSION_CODE) {
            alert('Invalid permission code.');
            return;
        }

        try {
            const registerResponse = await axios.post('/auth/register', {
                authData,
                role,
                name,
                email,
            });

            setRole(registerResponse.data.user.role);
            localStorage.setItem('token', registerResponse.data.token);
            setCurrentPage(`${registerResponse.data.user.role}Dashboard`);
        } catch (err) {
            console.error('An error occurred during the registration process.', err);
        }
    };

    return (
        <div className='Register'>
            <h1>Register</h1>
            <select value={role} onChange={(e) => setRoleState(e.target.value)}>
                <option value='student'>Student</option>
                <option value='college'>College</option>
                <option value='company'>Company</option>
            </select>
            <input type='text' placeholder='Name' value={name} onChange={(e) => setName(e.target.value)} />
            <input type='email' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} />
            {(role === 'college' || role === 'company') && (
                <input type='text' placeholder='Permission Code' value={permissionCode} onChange={(e) => setPermissionCode(e.target.value)} />
            )}
            <button onClick={handleRegister}>Register</button>
        </div>
    );
}

export default Register;
