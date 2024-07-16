// // TestAPI.js
// import React, { useState } from 'react';
// import axios from 'axios';
// import { ethers } from 'ethers';

// const TestAPI = () => {
//     const [response, setResponse] = useState('');
//     const [account, setAccount] = useState('');

//     const connectMetaMask = async () => {
//         if (window.ethereum) {
//             try {
//                 const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
//                 setAccount(accounts[0]);
//                 console.log('Connected account:', accounts[0]);
//             } catch (error) {
//                 console.error('Error connecting to MetaMask', error);
//             }
//         } else {
//             console.error('MetaMask not detected');
//         }
//     };

//     const signMessage = async (message) => {
//         if (window.ethereum && account) {
//             try {
//                 const provider = new ethers.providers.Web3Provider(window.ethereum);
//                 const signer = provider.getSigner();
//                 const signature = await signer.signMessage(message);
//                 return signature;
//             } catch (error) {
//                 console.error('Error signing message', error);
//             }
//         } else {
//             console.error('MetaMask not connected or account not set');
//         }
//     };

//     const testRequestMessage = async () => {
//         try {
//             const res = await axios.post('http://localhost:3001/auth/request-message', {
//                 address: account,
//                 chain: '0x1',
//                 networkType: 'evm',
//             });
//             setResponse(JSON.stringify(res.data, null, 2));
//         } catch (error) {
//             setResponse(error.message);
//         }
//     };

//     const testVerifyMessage = async () => {
//         try {
//             const message = 'YourTestMessage'; // Replace with your actual message
//             const signature = await signMessage(message);
//             const res = await axios.post('http://localhost:3001/auth/sign-message', {
//                 networkType: 'evm',
//                 message,
//                 signature,
//             });
//             setResponse(JSON.stringify(res.data, null, 2));
//         } catch (error) {
//             setResponse(error.message);
//         }
//     };

//     return (
//         <div>
//             <h1>Test API</h1>
//             {!account && <button onClick={connectMetaMask}>Connect MetaMask</button>}
//             {account && (
//                 <>
//                     <button onClick={testRequestMessage}>Test Request Message</button>
//                     <button onClick={testVerifyMessage}>Test Verify Message</button>
//                 </>
//             )}
//             <pre>{response}</pre>
//         </div>
//     );
// };

// export default TestAPI;

// TestAPI.js
import React, { useState } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';

const TestAPI = () => {
    const [response, setResponse] = useState('');
    const [account, setAccount] = useState('');

    const connectMetaMask = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setAccount(accounts[0]);
                console.log('Connected account:', accounts[0]);
            } catch (error) {
                console.error('Error connecting to MetaMask', error);
            }
        } else {
            console.error('MetaMask not detected');
        }
    };

    const signMessage = async (message) => {
        if (window.ethereum && account) {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const signature = await signer.signMessage(message);
                return signature;
            } catch (error) {
                console.error('Error signing message', error);
            }
        } else {
            console.error('MetaMask not connected or account not set');
        }
    };

    const testRequestMessage = async () => {
        try {
            const res = await axios.post('http://localhost:3001/auth/request-message', {
                address: account,
                chain: '0x1',
                networkType: 'evm',
            });
            setResponse(JSON.stringify(res.data, null, 2));
        } catch (error) {
            setResponse(error.message);
        }
    };

    const testVerifyMessage = async () => {
        try {
            const messageResponse = await axios.post('http://localhost:3001/auth/request-message', {
                address: account,
                chain: '0x1',
                networkType: 'evm',
            });
            const message = messageResponse.data.message;
            const signature = await signMessage(message);

            const res = await axios.post('http://localhost:3001/auth/sign-message', {
                networkType: 'evm',
                message,
                signature,
            });

            if (res.data.needsRegistration) {
                // Handle registration logic here
                console.log('User needs to register:', res.data.authData);
            } else {
                setResponse(JSON.stringify(res.data, null, 2));
            }
        } catch (error) {
            setResponse(error.message);
        }
    };

    return (
        <div>
            <h1>Test API</h1>
            {!account && <button onClick={connectMetaMask}>Connect MetaMask</button>}
            {account && (
                <>
                    <button onClick={testRequestMessage}>Test Request Message</button>
                    <button onClick={testVerifyMessage}>Test Sign Message</button>
                </>
            )}
            <pre>{response}</pre>
        </div>
    );
};

export default TestAPI;
