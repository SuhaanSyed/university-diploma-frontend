import React, { useState, useEffect } from 'react';
import Web3 from 'web3';

const VALID_PERMISSION_CODE = '100';

function Register({ setCurrentPage, setRole }) {
    const [role, setRoleState] = useState('student');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [permissionCode, setPermissionCode] = useState('');
    const [walletAddress, setWalletAddress] = useState('');

    const detectCurrentProvider = () => {
        let provider;
        if (window.ethereum) {
            provider = window.ethereum;
        } else if (window.web3) {
            provider = window.web3.currentProvider;
        } else {
            console.log('No Ethereum browser detected. You should consider trying MetaMask!');
        }
        return provider;
    };

    const onConnect = async () => {
        try {
            const currentProvider = detectCurrentProvider();
            if (currentProvider) {
                await currentProvider.request({ method: 'eth_requestAccounts' });
                const web3 = new Web3(currentProvider);
                const accounts = await web3.eth.getAccounts();
                setWalletAddress(accounts[0]);
            }
        } catch (err) {
            console.log(err);
        }
    };

    const handleRegister = () => {
        if (role === 'college' || role === 'company') {
            if (permissionCode !== VALID_PERMISSION_CODE) {
                alert('Invalid permission code.');
                return;
            }
        }

        if (!walletAddress) {
            alert('Please connect your MetaMask wallet.');
            return;
        }

        // Dummy logic for registration
        alert(`${role.charAt(0).toUpperCase() + role.slice(1)} ${name} registered successfully with wallet address ${walletAddress}!`);
        setRole(role);
        setCurrentPage(`${role}Dashboard`);
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
            <input type='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} />
            {(role === 'college' || role === 'company') && (
                <input type='text' placeholder='Permission Code' value={permissionCode} onChange={(e) => setPermissionCode(e.target.value)} />
            )}
            <button onClick={onConnect}>Connect MetaMask</button>
            {walletAddress && <p>Connected Wallet: {walletAddress}</p>}
            <button onClick={handleRegister}>Register</button>
        </div>
    );
}

export default Register;
