
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { signMessage } from './Auth/SignMessage';
import contractABI from "../abis/contractABI";
import { jwtDecode } from 'jwt-decode';
import {
    Box,
    Button,
    Heading,
    Text,
    VStack,
    Alert,
    AlertIcon,
    Progress,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Input
} from '@chakra-ui/react';

const StudentProgress = () => {
    const [students, setStudents] = useState([]);
    const [majors, setMajors] = useState([]);
    const [studentCourses, setStudentCourses] = useState([]);
    const [studentMajors, setStudentMajors] = useState([]);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const backendUrl = process.env.REACT_APP_BACKEND_URL;

    // for minting
    const [diplomaFile, setDiplomaFile] = useState(null);
    //const [selectedFile, setSelectedFile] = useState(null);



    useEffect(() => {
        fetchStudents();
        fetchMajors();
    }, []);

    useEffect(() => {
        if (students.length > 0) {
            students.forEach(student => {
                fetchStudentMajors(student.moralis_provider_id);
                fetchStudentCourses(student.moralis_provider_id);
            });
        }
    }, [students]);

    const uniqueStudents = Array.from(new Set(students.map(s => s.moralis_provider_id)))
        .map(id => students.find(s => s.moralis_provider_id === id));

    const uniqueStudentMajors = Array.from(new Set(studentMajors.map(sm => `${sm.student_id}-${sm.major_id}`)))
        .map(key => studentMajors.find(sm => `${sm.student_id}-${sm.major_id}` === key));

    // unique student courses
    // const uniqueStudentCourses = Array.from(new Set(studentCourses.map(sc => `${sc.student_id}-${sc.name}`)))
    //     .map(key => studentCourses.find(sc => `${sc.student_id}-${sc.name}` === key));


    const fetchStudents = async () => {
        try {

            const response = await axios.get(`${backendUrl}/api/students`);
            setStudents(response.data);
        } catch (error) {
            setError('Error fetching students');
        }
    };

    const fetchMajors = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setMessage('Error: User not authenticated');
            return;
        }

        try {
            const response = await axios.get(`${backendUrl}/api/majors`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setMajors(response.data);
        } catch (error) {
            setError(`Error fetching majors: ${error.message}`);
        }
    };

    const fetchStudentCourses = async (studentId) => {
        try {
            const response = await axios.get(`${backendUrl}/api/student_courses/${studentId}`);
            // only append if the whole row of response.data does not exist in studentCourses
            const newCourses = response.data.map(course => ({
                ...course,
                student_id: studentId
            }));

            //setStudentCourses(prevCourses => [...prevCourses, ...response.data]);
            setStudentCourses(prevCourses => {
                // Filter out courses that already exist in prevCourses
                const filteredNewCourses = newCourses.filter(newCourse =>
                    !prevCourses.some(course => course.id === newCourse.id && course.student_id === newCourse.student_id)
                );
                return [...prevCourses, ...filteredNewCourses];
            });
        } catch (error) {
            setError('Error fetching student courses');
        }
    };

    const fetchStudentMajors = async (studentId) => {
        try {

            const response = await axios.get(`${backendUrl}/api/student_majors/${studentId}`);
            setStudentMajors(prevMajors => [...prevMajors, ...response.data]);
        } catch (error) {
            setError('Error fetching student majors');
        }
    };

    const handleFileChange = (event) => {
        setDiplomaFile(event.target.files[0]);
    };

    const calculateProgress = (studentId, majorId) => {
        const studentCoursesForMajor = studentCourses.filter(course => course.student_id === studentId && course.major_id === majorId);

        const major = majors.find(major => major.id === majorId);
        if (!major) return 0;

        const totalCourses = major.graduation_requirements.length;
        let passedCourses = 0;

        studentCoursesForMajor.forEach(course => {
            const requirement = major.graduation_requirements.find(req => req.name === course.name);
            if (requirement && parseInt(course.grade, 10) >= parseInt(requirement.grade, 10)) {
                passedCourses++;
            }
        });

        return (passedCourses / totalCourses) * 100;
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

            console.log("Document uploaded to ipfs");
            return response.data.IpfsHash;
        } catch (error) {
            setError(`Error uploading to IPFS: ${error.message}`);
        }
    };

    const connectMetaMask = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                // setAccount(accounts[0]);
                console.log('Connected account:', accounts[0]);

                return accounts[0];
            } catch (error) {
                console.error('Error connecting to MetaMask', error);
            }
        } else {
            console.error('MetaMask not detected');
        }
    };

    const mintDiploma = async (studentId, majorId) => {
        // get student details from students and studentId
        console.log(studentId, majorId);
        console.log(students);
        const student = students.find(s => s.moralis_provider_id === studentId);
        if (!student) {
            setError('Student not found');
            return;
        }

        // get name of student, wallet address of student (present in metadata)
        const studentName = student.name;
        const studentWalletAddress = student.metadata.address;
        if (!studentWalletAddress) {
            setError('Student wallet address not found');
            return;
        }

        // get major name from majors and majorId
        const major = majors.find(m => m.id === majorId);
        if (!major) {
            setError('Major not found');
            return;
        }
        const majorName = major.name;
        console.log("major name", majorName);

        // get name from the temporary storage (jwt)
        const token = localStorage.getItem('token');
        const decodedToken = jwtDecode(token);
        const name = decodedToken.name;
        console.log("name: ", name);


        // connect metamask
        let account = await connectMetaMask();
        console.log("account: ", account);


        // craft a message saying: {college name} certifies that {student} has satisfactorily completed the necessary requirements of bachelors of {major} and thereby is presented with this diploma.
        const messageToSign = `${name} certifies that ${studentName} has satisfactorily completed the necessary requirements of bachelors of ${majorName} and thereby is presented with this diploma.`;
        const signedMessage = await signMessage(messageToSign, account);


        // upload file to ipfs and get the ipfsMetaData
        const ipfsMetadata = await uploadToIPFS();
        console.log("ipfsMetadata: ", ipfsMetadata);


        const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

        if (window.ethereum && account) {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractABI.abi, signer);

            // console.log(message, signature);
            // convert major id to string


            // Log all arguments to verify their values           
            console.log("studentWalletAddress: ", studentWalletAddress);
            console.log("ipfsMetadata URL: ", `https://gateway.pinata.cloud/ipfs/${ipfsMetadata}`);
            console.log("studentName: ", studentName);
            console.log("MajorId:", majorId.toString());
            console.log("account: ", account);
            console.log("name: ", name);
            console.log("message: ", messageToSign);
            console.log("signature: ", signedMessage);


            // Ensure none of the arguments are empty
            if (!studentWalletAddress || !ipfsMetadata || !studentName || !account || !name || !messageToSign || !signedMessage) {
                setError('One or more arguments are missing or invalid.');
                return;
            }

            try {
                const tx = await contract.mintNFT(
                    studentWalletAddress,
                    `https://gateway.pinata.cloud/ipfs/${ipfsMetadata}`,
                    studentId,
                    studentName,
                    majorId.toString(),
                    account,
                    name,
                    messageToSign,
                    signedMessage,

                );
                await tx.wait();
                setMessage('NFT minted successfully');
                console.log(tx.hash);
            } catch (error) {
                setError(`Error minting NFT: ${error.message}`);
            }
        }

        console.log(`Minting diploma for student ${studentId} and major ${majorId}`);
    };





    return (
        <Box p={5}>
            <Heading mb={6}>Student Progress</Heading>
            {error && (
                <Alert status="error" mb={4}>
                    <AlertIcon />
                    {error}
                </Alert>
            )}
            {message && (
                <Alert status="success" mb={4}>
                    <AlertIcon />
                    {message}
                </Alert>
            )}
            <VStack spacing={4} align="stretch">
                <Accordion allowToggle>
                    {uniqueStudents.map((student) => (
                        <AccordionItem key={student.moralis_provider_id}>
                            <h2>
                                <AccordionButton>
                                    <Box flex="1" textAlign="left">
                                        {student.name}
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </h2>
                            <AccordionPanel pb={4}>
                                {uniqueStudentMajors.filter(sm => sm.student_id === student.moralis_provider_id).map((major) => {
                                    const progress = calculateProgress(student.moralis_provider_id, major.major_id);
                                    return (
                                        <Box key={`${student.moralis_provider_id}-${major.major_id}`} mt={2}>
                                            <Text>{majors.find(m => m.id === major.major_id)?.name}</Text>
                                            <Progress value={progress} size="sm" colorScheme="green" />
                                            <Text>{`${Math.floor(progress)}%`}</Text>
                                            {progress === 100 && (
                                                <>
                                                    <Input type="file" onChange={handleFileChange} mt={2} />
                                                    <Button mt={2} colorScheme="blue" onClick={() => mintDiploma(student.moralis_provider_id, major.major_id)}>
                                                        Mint Diploma
                                                    </Button>
                                                </>
                                            )}
                                        </Box>
                                    );
                                })}
                                {uniqueStudentMajors.filter(sm => sm.student_id === student.moralis_provider_id).every(major => calculateProgress(student.moralis_provider_id, major.major_id) === 100) && (
                                    <Text mt={2} color="green.500">All majors completed!</Text>
                                )}
                            </AccordionPanel>
                        </AccordionItem>
                    ))}
                </Accordion>
            </VStack>
        </Box>
    );
};

export default StudentProgress;
