import React, { useState } from "react";
import Web3 from "web3";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAmoy } from "./AmoyContext"; // Import useAmoy hook
import { signMessage } from './SignMessage'; // Import the signMessage function
import { Button, Text, VStack, useToast } from "@chakra-ui/react";

function Login({ setIsLoggedIn }) {
    const {
        walletConnected,
        currentChainId,
        connectWallet,
        addPolygonAmoyNetwork,
    } = useAmoy(); // Ensure correct usage of useAmoy hook
    const toast = useToast();
    const [walletAddress, setWalletAddress] = useState("");
    const [error, setError] = useState("");
    const [showRegisterMessage, setShowRegisterMessage] = useState(false); // State for registration message
    const navigate = useNavigate();
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    const onConnect = async () => {
        try {
            if (!walletConnected) {
                await connectWallet();
            }

            if (currentChainId !== "0x13882") {
                await addPolygonAmoyNetwork();
                setError("Please switch MetaMask network to Polygon Amoy Testnet.");
                return;
            }

            const web3 = new Web3(window.ethereum);
            const accounts = await web3.eth.getAccounts();
            setWalletAddress(accounts[0]);
            console.log("statement 1:");
            console.log(accounts[0]);
            console.log(currentChainId);

            // connect to backend url

            const messageResponse = await axios.post(`${backendUrl}/auth/request-message`, {
                address: accounts[0],
                chain: '0x1',
                networkType: 'evm',
            });
            console.log("statement 2:");
            const message = messageResponse.data.message;
            const signature = await signMessage(message, accounts[0]); // Use signMessage function here

            const verifyResponse = await axios.post(`${backendUrl}/auth/sign-message`, {
                networkType: "evm", // Adjust networkType as per your backend's requirements
                message,
                signature,
            });
            console.log("statement 3:");

            if (verifyResponse.data.needsRegistration) {
                toast({
                    title: "Registration Required",
                    description: "Please register to continue.",
                    status: "info",
                    duration: 3000,
                    isClosable: true,
                });
                setTimeout(() => {
                    navigate("/register", { state: { authData: verifyResponse.data.authData } });
                }, 3000); // Wait for 3 seconds before navigating
            } else {
                setIsLoggedIn(true);
                localStorage.setItem("token", verifyResponse.data.token);
                toast({
                    title: "Login successful.",
                    description: "You've been logged in successfully.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                navigate('/dashboard');
            }
        } catch (err) {
            toast({
                title: "Error logging in.",
                description: "An error occurred during the login process.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            console.error(err);
        }
    };

    return (
        <VStack spacing={4} align="stretch">
            <Text fontSize="2xl" textAlign="center">Login</Text>
            <Button colorScheme="teal" onClick={onConnect}>Login with MetaMask</Button>
            {walletAddress && <Text>Connected Wallet: {walletAddress}</Text>}
        </VStack>
    );
}

export default Login;
