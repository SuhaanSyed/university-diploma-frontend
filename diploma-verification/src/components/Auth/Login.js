import React, { useState } from "react";
import Web3 from "web3";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAmoy } from "./AmoyContext"; // Import useAmoy hook

function Login({ setRole }) {
    const {
        isMetaMaskInstalled,
        walletConnected,
        currentChainId,
        connectWallet,
        addPolygonAmoyNetwork,
    } = useAmoy(); // Ensure correct usage of useAmoy hook

    const [walletAddress, setWalletAddress] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

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

            const messageResponse = await axios.post("http://localhost:3001/auth/request-message", {
                address: accounts[0],
                chain: currentChainId,
                networkType: "amoy", // Adjust networkType as per your backend's requirements
            });

            const message = messageResponse.data.message;
            const signature = await web3.eth.personal.sign(message, accounts[0]);

            const verifyResponse = await axios.post("http://localhost:3001/auth/sign-message", {
                networkType: "amoy", // Adjust networkType as per your backend's requirements
                message,
                signature,
            });

            if (verifyResponse.data.needsRegistration) {
                navigate("/register", { state: { authData: verifyResponse.data.authData } });
            } else {
                setRole(verifyResponse.data.user.role);
                localStorage.setItem("token", verifyResponse.data.token);
                navigate(`/${verifyResponse.data.user.role}Dashboard`);
            }
        } catch (err) {
            setError("An error occurred during the login process.");
            console.error(err);
        }
    };

    return (
        <div className="Login">
            <h1>Login</h1>
            <button onClick={onConnect}>Login with MetaMask</button>
            {walletAddress && <p>Connected Wallet: {walletAddress}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}

export default Login;
