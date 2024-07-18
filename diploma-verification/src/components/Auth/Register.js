import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { signMessage } from './SignMessage'; // Import the signMessage function

function Register({ setCurrentPage, setRole }) {
    const [walletConnected, setWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');
    const [authData, setAuthData] = useState(null);
    const [role, setRoleState] = useState('student');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [permissionCode, setPermissionCode] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const VALID_PERMISSION_CODE = '100';

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const web3 = new Web3(window.ethereum);
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setWalletAddress(accounts[0]);
                setWalletConnected(true);

                const messageResponse = await axios.post('http://localhost:3002/auth/request-message', {
                    address: accounts[0],
                    chain: '0x1',
                    networkType: 'evm',
                });

                const message = messageResponse.data.message;
                const signature = await signMessage(message, accounts[0]);

                const authResponse = await axios.post('http://localhost:3002/auth/get-auth-data', {
                    networkType: "evm",
                    message,
                    signature,
                });

                setAuthData(authResponse.data.authData);
            } catch (err) {
                setError('An error occurred while connecting to the wallet.');
                console.error(err);
            }
        } else {
            setError('MetaMask is not installed.');
        }
    };

    const handleRegister = async () => {
        if (!authData) {
            setError('Please connect your wallet first.');
            return;
        }

        if ((role === 'college' || role === 'company') && permissionCode !== VALID_PERMISSION_CODE) {
            setError('Invalid permission code.');
            return;
        }

        try {
            const registerResponse = await axios.post('http://localhost:3002/auth/register', {
                authData,
                role,
                name,
                email,
            });

            setRole(registerResponse.data.user.role);
            localStorage.setItem('token', registerResponse.data.token);
            setCurrentPage(`${registerResponse.data.user.role}Dashboard`);
        } catch (err) {
            if (err.response && err.response.data) {
                if (err.response.data.error === 'User with this account already exists.') {
                    setError('A user with this account already exists. Please use a different account.');
                } else {
                    setError('An error occurred during the registration process.');
                }
            } else {
                setError('An error occurred during the registration process.');
            }
            console.error('An error occurred during the registration process.', err);
        }
    };

    useEffect(() => {
        console.log('walletConnected changed:', walletConnected);
    }, [walletConnected]);

    useEffect(() => {
        console.log('walletAddress changed:', walletAddress);
    }, [walletAddress]);

    useEffect(() => {
        console.log('authData changed:', authData);
    }, [authData]);

    useEffect(() => {
        console.log('role changed:', role);
    }, [role]);

    useEffect(() => {
        console.log('name changed:', name);
    }, [name]);

    useEffect(() => {
        console.log('email changed:', email);
    }, [email]);

    useEffect(() => {
        console.log('permissionCode changed:', permissionCode);
    }, [permissionCode]);

    useEffect(() => {
        console.log('error changed:', error);
    }, [error]);

    return (
        <div className='Register'>
            <h1>Register</h1>
            <button onClick={connectWallet}>
                {walletConnected ? `Wallet Connected: ${walletAddress}` : 'Connect Wallet'}
            </button>
            {walletConnected && (
                <>
                    <select value={role} onChange={(e) => setRoleState(e.target.value)}>
                        <option value='student'>Student</option>
                        <option value='college'>College</option>
                        <option value='company'>Company</option>
                    </select>
                    <input
                        type='text'
                        placeholder='Name'
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input
                        type='email'
                        placeholder='Email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {(role === 'college' || role === 'company') && (
                        <input
                            type='text'
                            placeholder='Permission Code'
                            value={permissionCode}
                            onChange={(e) => setPermissionCode(e.target.value)}
                        />
                    )}
                    <button onClick={handleRegister}>Register</button>
                </>
            )}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

export default Register;
