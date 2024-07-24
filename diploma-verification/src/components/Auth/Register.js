import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { signMessage } from './SignMessage'; // Import the signMessage function
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Select,
    useToast,
    VStack
} from '@chakra-ui/react';

function Register({ setIsLoggedIn }) {
    const [walletConnected, setWalletConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');
    const [authData, setAuthData] = useState(null);
    const [role, setRoleState] = useState('student');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [permissionCode, setPermissionCode] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const toast = useToast();
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    const VALID_PERMISSION_CODE = '100';

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                // const web3 = new Web3(window.ethereum);
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setWalletAddress(accounts[0]);
                setWalletConnected(true);

                const messageResponse = await axios.post(`${backendUrl}/auth/request-message`, {
                    address: accounts[0],
                    chain: '0x1',
                    networkType: 'evm',
                });

                const message = messageResponse.data.message;
                const signature = await signMessage(message, accounts[0]);

                const authResponse = await axios.post(`${backendUrl}/auth/get-auth-data`, {
                    networkType: "evm",
                    message,
                    signature,
                });

                setAuthData(authResponse.data.authData);
            } catch (err) {
                toast({
                    title: 'Error connecting wallet',
                    description: error.message,
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                });
                console.error(err);
            }
        } else {
            toast({
                title: 'Ethereum object not found',
                description: 'Please install MetaMask!',
                status: 'warning',
                duration: 9000,
                isClosable: true,
            });
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
            const registerResponse = await axios.post(`${backendUrl}/auth/get-register`, {
                authData,
                role,
                name,
                email,
            });

            setIsLoggedIn(true);
            localStorage.setItem('token', registerResponse.data.token);
            navigate('/dashboard');
        } catch (err) {
            let errorMessage = 'An error occurred during the registration process.';
            if (err.response && err.response.data) {
                if (err.response.data.error === 'User with this account already exists.') {
                    errorMessage = 'A user with this account already exists. Please use a different account.';
                }
            }

            toast({
                title: "Registration Error",
                description: errorMessage,
                status: "error",
                duration: 9000,
                isClosable: true,
                position: "top",
            });

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
        <Box p={5}>
            <VStack spacing={4} align="stretch">
                <FormControl id="wallet">
                    <FormLabel>Wallet Address</FormLabel>
                    <Input type="text" value={walletAddress} isReadOnly />
                    <Button mt={2} colorScheme="blue" onClick={connectWallet} disabled={walletConnected}>
                        {walletConnected ? 'Wallet Connected' : 'Connect Wallet'}
                    </Button>
                </FormControl>
                <FormControl id="name">
                    <FormLabel>Name</FormLabel>
                    <Input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                </FormControl>
                <FormControl id="email">
                    <FormLabel>Email</FormLabel>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </FormControl>
                <FormControl id="role">
                    <FormLabel>Role</FormLabel>
                    <Select value={role} onChange={(e) => setRoleState(e.target.value)}>
                        <option value="student">Student</option>
                        <option value="college">College</option>
                        <option value="company">Company</option>
                    </Select>
                </FormControl>
                {role === 'college' || role === 'company' ? (
                    <FormControl id="permissionCode">
                        <FormLabel>Permission Code</FormLabel>
                        <Input type="text" value={permissionCode} onChange={(e) => setPermissionCode(e.target.value)} />
                    </FormControl>
                ) : null}
                <Button colorScheme="teal" mt={4} onClick={handleRegister}>Register</Button>
            </VStack>
        </Box>
    );
}

export default Register;
