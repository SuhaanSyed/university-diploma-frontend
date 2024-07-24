import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Box, Button, Text } from '@chakra-ui/react';
import contractABI from "../abis/contractABI"; // Adjust the path to your contract ABI

const Diploma = () => {
    const [diplomas, setDiplomas] = useState([]);
    const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

    useEffect(() => {
        const loadDiplomas = async () => {
            if (window.ethereum) {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                await provider.send("eth_requestAccounts", []);
                const signer = provider.getSigner();
                const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);

                const totalSupply = await contract.totalSupply();
                const diplomasArray = [];
                for (let i = ethers.BigNumber.from(1); i.lte(totalSupply); i = i.add(1)) {
                    const metadata = await contract.getTokenMetadata(i);
                    diplomasArray.push(metadata);
                }
                setDiplomas(diplomasArray);
            }
        };

        loadDiplomas();
    }, [contractAddress]);

    const verifySignature = (message, signature, expectedSigner) => {
        const messageHash = ethers.utils.hashMessage(message);
        const recoveredSigner = ethers.utils.recoverAddress(messageHash, signature);
        return recoveredSigner.toLowerCase() === expectedSigner.toLowerCase();
    };

    return (
        <Accordion allowToggle>
            {diplomas.map((diploma, index) => {

                //string studentName;
                // string studentID;
                // address studentAddress;
                // string majorId;
                // string diplomaUri;
                // address collegeAddress;
                // string collegeName;
                // string message;
                // bytes signature;
                const [name, studentID, address, majorId, diplomaUri, collegeAddress, , message, signature] = diploma;
                return (
                    <AccordionItem key={index}>
                        <h2>
                            <AccordionButton>
                                <Box flex="1" textAlign="left">
                                    {name} - {majorId}
                                </Box>
                                <AccordionIcon />
                            </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                            <Text><strong>Name:</strong> {name}</Text>
                            <Text><strong>Account:</strong> {address}</Text>
                            <Text><strong>Message:</strong> {message}</Text>
                            <Button mt={2} onClick={() => window.open(diplomaUri, '_blank')}>
                                View Diploma
                            </Button>
                            <Button mt={2} ml={2} onClick={() => alert(verifySignature(message, signature, collegeAddress) ? 'Verified' : 'Not Verified')}>
                                Verify
                            </Button>
                        </AccordionPanel>
                    </AccordionItem>
                );
            })}
        </Accordion>
    );
};

export default Diploma;