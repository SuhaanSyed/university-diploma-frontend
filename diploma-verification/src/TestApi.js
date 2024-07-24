import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { signMessage } from './components/Auth/SignMessage'; // Assuming you have the utils.js file in the same directory
import contractABI from "./abis/contractABI";
import { Box, Button, Heading, Select, Input, Text, VStack } from '@chakra-ui/react';
import { BigNumber } from 'ethers';
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

    // useEffect handle signature


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

    function verifySignature(message, signature, expectedSigner) {
        // Compute the hash of the message
        const messageHash = ethers.utils.hashMessage(message);

        // Recover the signer's address from the message hash and signature
        const recoveredSigner = ethers.utils.recoverAddress(messageHash, signature);

        // Compare the recovered address with the expected address
        return recoveredSigner.toLowerCase() === expectedSigner.toLowerCase();
    }


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
            setMessage('Diploma uploaded to IPFS');
        } catch (error) {
            setMessage(`Error uploading to IPFS: ${error.message}`);
        }
    };

    const mintNFT = async () => {
        // if (!ipfsMetadata) {
        //     setMessage('Please select a student and upload a diploma file');
        //     return;
        // }

        // Assume the contract is already deployed and you have the ABI and contract address
        const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

        if (window.ethereum && account) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            console.log("signer:", signer);
            const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);

            console.log(message, signature);

            try {
                const tx = await contract.mintNFT(
                    "0x49fd0Af235a139b1553192cF34dfd39C7020652c",
                    `https://gateway.pinata.cloud/ipfs/${ipfsMetadata}`,
                    "Suhaan Syed",
                    "0xf3Cab80a105bC82188f62615E6D10722339DA871",
                    "University of Kansas",
                    message,
                    signature,

                );
                await tx.wait();
                setMessage('NFT minted successfully');
                console.log(tx.hash);
            } catch (error) {
                setMessage(`Error minting NFT: ${error.message}`);
            }

            try {
                const totalSupply = await contract.totalSupply();
                for (let i = BigNumber.from(1); i.lte(totalSupply); i = i.add(1)) {
                    console.log(`Verifying NFT with tokenId: ${i.toString()}`);
                    await verifyNFT(contract, i); // Ensure verifyNFT is awaited
                    console.log(await contract.getTokenName(i)); // Ensure tokenId is passed correctly
                    console.log(await contract.getTokenCollegeName(i)); // Ensure tokenId is passed correctly
                    console.log(await contract.getTokenMessage(i)); // Ensure tokenId is passed correctly
                    console.log(await contract.getTokenSignature(i)); // Ensure tokenId is passed correctly
                    // get tokenUri
                    const tokenUri = await contract.tokenURI(i);
                    console.log(tokenUri);
                }
            } catch (error) {
                console.error("Failed to load NFTs:", error);
            }

            // }
            // 0xaf23ad1ee4695d69aa41a77b9133dd5ff3622451e0359fd66de69e943c1bfb38
            // 0xf3Cab80a105bC82188f62615E6D10722339DA871
            // call verify function from smart contract on the tokenId to verify it

        }
    };
    // hex signature to bytes signature



    const verifyNFT = async (contract, tokenId) => {
        try {
            const verified = await contract.verifyCollegeSignature(tokenId);
            console.log(`NFT with tokenId ${tokenId} is verified: ${verified}`);
        } catch (error) {
            console.error(`Failed to verify NFT with tokenId ${tokenId}:`, error);
        }
    }

    return (
        <Box p={5}>
            <Heading mb={6}>Mint Diploma NFT</Heading>
            {!account && <Button colorScheme="teal" onClick={connectMetaMask}>Connect MetaMask</Button>}
            {account && (
                <VStack spacing={4} align="stretch">
                    <Box>
                        <Heading size="md" mb={2}>Select Student</Heading>
                        {/* <Select placeholder="Select a student" onChange={(e) => setSelectedStudent(students.find(student => student.id === e.target.value))}>
                            {students.map((student) => (
                                <option key={student.id} value={student.id}>
                                    {student.name}
                                </option>
                            ))}
                        </Select> */}
                    </Box>
                    <Box>
                        <Heading size="md" mb={2}>Upload Diploma</Heading>
                        <Input type="file" onChange={handleDiplomaFileChange} />
                        <Button colorScheme="teal" mt={2} onClick={uploadToIPFS}>Upload to IPFS</Button>
                    </Box>
                    <Button colorScheme="teal" onClick={handleSignMessage}>Sign Message</Button>
                    <Button colorScheme="teal" onClick={mintNFT}>Mint NFT</Button>
                </VStack>
            )}
            <Text as="pre" mt={4}>{response}</Text>
            <Text mt={2}>{message}</Text>
        </Box>
    );
};

export default TestAPI;
