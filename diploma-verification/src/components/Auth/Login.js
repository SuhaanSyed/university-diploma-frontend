import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import Web3 from 'web3';

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        const { user, error } = await supabase.auth.signIn({ email, password });
        if (user) {
            navigate.push('/dashboard');
        } else {
            alert(error.message);
        }
    };

    const handleMetaMaskLogin = async () => {
        if (window.ethereum) {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const web3 = new Web3(window.ethereum);
                const accounts = await web3.eth.getAccounts();
                const account = accounts[0];
                // Handle authentication using MetaMask address
                alert(`Logged in with MetaMask address: ${account}`);
                navigate.push('/dashboard');
            } catch (error) {
                console.error(error);
            }
        } else {
            alert('MetaMask not detected. Please install MetaMask.');
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
            </form>
            <button onClick={handleMetaMaskLogin}>Login with MetaMask</button>
        </div>
    );
}

export default Login;
