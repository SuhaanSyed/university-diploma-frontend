import React, { useState } from 'react';
import Web3 from 'web3';

function Login({ setCurrentPage, setRole }) {
    const [walletAddress, setWalletAddress] = useState('');
    const [role, setRoleState] = useState('');

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

                // Dummy logic to determine role
                // In a real scenario, you would fetch this from your backend
                if (accounts[0] === '0xValidStudentAddress') {
                    setRole('student');
                } else if (accounts[0] === '0xValidCollegeAddress') {
                    setRole('college');
                } else if (accounts[0] === '0xValidCompanyAddress') {
                    setRole('company');
                } else {
                    alert('No account found. Please register.');
                    setCurrentPage('register');
                    return;
                }

                setCurrentPage(`${role}Dashboard`);
            }
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className='Login'>
            <h1>Login</h1>
            <button onClick={onConnect}>Login with MetaMask</button>
            {walletAddress && <p>Connected Wallet: {walletAddress}</p>}
        </div>
    );
}

export default Login;
