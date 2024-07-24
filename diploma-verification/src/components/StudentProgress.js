
import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
} from '@chakra-ui/react';

const StudentProgress = () => {
    const [students, setStudents] = useState([]);
    const [majors, setMajors] = useState([]);
    const [studentCourses, setStudentCourses] = useState([]);
    const [studentMajors, setStudentMajors] = useState([]);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

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
            const response = await axios.get('http://localhost:3002/api/students');
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
            const response = await axios.get('http://localhost:3002/api/majors', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setMajors(response.data);
        } catch (error) {
            setMessage(`Error fetching majors: ${error.message}`);
        }
    };

    const fetchStudentCourses = async (studentId) => {
        try {
            const response = await axios.get(`http://localhost:3002/api/student_courses/${studentId}`);
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
            const response = await axios.get(`http://localhost:3002/api/student_majors/${studentId}`);
            setStudentMajors(prevMajors => [...prevMajors, ...response.data]);
        } catch (error) {
            setError('Error fetching student majors');
        }
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

    const mintDiploma = (studentId, majorId) => {
        // Placeholder for minting logic
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
                                                <Button mt={2} colorScheme="blue" onClick={() => mintDiploma(student.id, major.major_id)}>
                                                    Mint Diploma
                                                </Button>
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
