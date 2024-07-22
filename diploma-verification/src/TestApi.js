import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { signMessage } from './components/Auth/SignMessage'; // Assuming you have the utils.js file in the same directory
import contractABI from "./abis/contractABI";;
const TestAPI = () => {
    const [response, setResponse] = useState('');
    const [account, setAccount] = useState('');
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [collegeName, setCollegeName] = useState('');
    const [collegeAddress, setCollegeAddress] = useState('');
    const [message, setMessage] = useState('This is a test sign');
    const [signature, setSignature] = useState('');
    const [diplomaFile, setDiplomaFile] = useState(null);
    const [ipfsMetadata, setIpfsMetadata] = useState('');
    const [tokenId, setTokenId] = useState(null);

    // useEffect(() => {
    //     fetchStudents();
    //     const token = localStorage.getItem('token');
    //     if (token) {
    //         const { collegeName, collegeAddress } = JSON.parse(atob(token.split('.')[1]));
    //         setCollegeName(collegeName);
    //         setCollegeAddress(collegeAddress);
    //     }
    // }, []);

    // const fetchStudents = async () => {
    //     try {
    //         const token = localStorage.getItem('token');
    //         const response = await axios.get('http://localhost:3002/api/students', {
    //             headers: {
    //                 Authorization: `Bearer ${token}`
    //             }
    //         });
    //         setStudents(response.data);
    //     } catch (error) {
    //         setMessage(`Error fetching students: ${error.message}`);
    //     }
    // };

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

    const handleSignMessage = async () => {
        const signedMessage = await signMessage(message, account);
        setSignature(signedMessage);
    };

    const handleDiplomaFileChange = (event) => {
        setDiplomaFile(event.target.files[0]);
    };

    const uploadToIPFS = async () => {
        const formData = new FormData();
        formData.append('file', diplomaFile);

        try {
            const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
                headers: {
                    Authorization: `Bearer ${process.env.REACT_APP_PINATA_JWT}`
                }
            });
            setIpfsMetadata(response.data.IpfsHash);
        } catch (error) {
            setMessage(`Error uploading to IPFS: ${error.message}`);
        }
    };

    const mintNFT = async () => {
        if (!ipfsMetadata) {
            setMessage('Please select a student and upload a diploma file');
            return;
        }

        // Assume the contract is already deployed and you have the ABI and contract address
        const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

        if (window.ethereum && account) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);

            try {
                const tx = await contract.mintNFT(
                    "0x49fd0Af235a139b1553192cF34dfd39C7020652c",
                    `https://gateway.pinata.cloud/ipfs/${ipfsMetadata}`,
                    "Suhaan Syed",
                    "0xf3Cab80a105bC82188f62615E6D10722339DA871",
                    "University of Kansas",
                    message,
                    signature
                );
                await tx.wait();
                setMessage('NFT minted successfully');
            } catch (error) {
                setMessage(`Error minting NFT: ${error.message}`);
            }

            // iterate through all the tokenIds in the smart contract
            const totalSupply = await contract.totalSupply();
            for (let i = 0; i < totalSupply; i++) {
                // const tokenId = await contract.tokenByIndex(i);
                console.log(`Verifying NFT with tokenId: ${i}`);
                verifyNFT(contract, i);
            }

            // call verify function from smart contract on the tokenId to verify it

        }
    };

    const verifyNFT = async (contract, tokenId) => {
        const verified = await contract.verifyCollegeSignature(tokenId);
        console.log(`NFT with tokenId ${tokenId} is verified: ${verified}`);
    }

    return (
        <div>
            <h1>Mint Diploma NFT</h1>
            {!account && <button onClick={connectMetaMask}>Connect MetaMask</button>}
            {account && (
                <>
                    <div>
                        <h3>Select Student</h3>
                        <select onChange={(e) => setSelectedStudent(students.find(student => student.id === e.target.value))}>
                            <option value="">Select a student</option>
                            {students.map((student) => (
                                <option key={student.id} value={student.id}>
                                    {student.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <h3>Upload Diploma</h3>
                        <input type="file" onChange={handleDiplomaFileChange} />
                        <button onClick={uploadToIPFS}>Upload to IPFS</button>
                    </div>
                    <button onClick={handleSignMessage}>Sign Message</button>
                    <button onClick={mintNFT}>Mint NFT</button>
                </>
            )}
            <pre>{response}</pre>
            <p>{message}</p>
        </div>
    );
};

export default TestAPI;
