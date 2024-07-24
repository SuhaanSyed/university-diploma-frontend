import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Box,
    Button,
    Flex,
    Heading,
    Progress,
    Text,
    VStack,
    HStack,
    List,
    ListItem,
    Alert,
    AlertIcon,
    Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon
} from '@chakra-ui/react';

const StudentProgress = () => {
    const [students, setStudents] = useState([]);
    const [majors, setMajors] = useState([]);
    const [studentCourses, setStudentCourses] = useState([]);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [expandedStudent, setExpandedStudent] = useState(null);
    const [viewingProgress, setViewingProgress] = useState(null);
    const [studentMajors, setStudentMajors] = useState({});
    // let majors = [];

    // const fetchMajors = useCallback(async () => {
    //     console.log("fetch majors called");
    //     const token = localStorage.getItem('token');
    //     if (!token) {
    //         setMessage('Error: User not authenticated');
    //         return;
    //     }

    //     try {
    //         const response = await axios.get('http://localhost:3002/api/majors', {
    //             headers: {
    //                 Authorization: `Bearer ${token}`
    //             }
    //         });
    //         console.log(response.data);
    //         setMajors(response.data);
    //         console.log("majors:", majors);
    //     } catch (error) {
    //         setMessage(`Error fetching majors: ${error.message}`);
    //     }
    // }, []);

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {

        console.log("fetch majors called");
        const token = localStorage.getItem('token');
        if (!token) {
            setMessage('Error: User not authenticated');
            return;
        }


        axios.get('http://localhost:3002/api/majors', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(response => {
            setMajors(response.data);
        })
            .catch(error => {
                console.error('There was an error fetching the majors!', error);
            });

    }, []);



    // const fetchMajors = async () => {
    //     console.log("fetch majors called");
    //     const token = localStorage.getItem('token');
    //     if (!token) {
    //         setMessage('Error: User not authenticated');
    //         return;
    //     }

    //     try {
    //         const response = await axios.get('http://localhost:3002/api/majors', {
    //             headers: {
    //                 Authorization: `Bearer ${token}`
    //             }
    //         });
    //         console.log(response.data);
    //         setMajors(response.data);
    //         // majors = response.data;
    //         console.log("majors: ", majors);
    //     } catch (error) {
    //         setMessage(`Error fetching majors: ${error.message}`);
    //     }
    // };



    // const handleViewProgress = (studentId) => {
    //     console.log("handle view called");
    //     fetchStudentCourses(studentId);
    //     console.log("majors: ", majors)
    //     // console.log(studentId);
    //     // setExpandedStudent(expandedStudent === studentId ? null : studentId);
    //     // console.log(expandedStudent);
    //     setViewingProgress(prev => (prev === studentId ? null : studentId));
    // };

    const fetchStudentMajors = useCallback((studentId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('Error: User not authenticated');
            return;
        }

        axios.get(`http://localhost:3002/api/student_majors/${studentId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => {
                setStudentMajors(prev => ({ ...prev, [studentId]: response.data }));
            })
            .catch(error => {
                console.error('There was an error fetching the student majors!', error);
            });
    }, []);

    const handleViewProgress = useCallback((studentId) => {
        if (!studentMajors[studentId]) {
            fetchStudentMajors(studentId);
        }
        setViewingProgress(prev => (prev === studentId ? null : studentId));
    }, [studentMajors, fetchStudentMajors]);

    const fetchStudents = async () => {
        try {
            const response = await axios.get('http://localhost:3002/api/students');
            setStudents(response.data);
        } catch (error) {
            setError('Error fetching students');
        }
    };





    const getTotalCourses = (majorId) => {
        console.log("getTotalCourses");
        //return studentCourses.filter(course => course.majorId === majorId).length;
        return 40;
    };


    const fetchStudentCourses = async (studentId) => {
        console.log("fetch student courses called");
        try {
            const response = await axios.get(`http://localhost:3002/api/student_courses/${studentId}`);
            setStudentCourses(response.data);
            console.log(studentCourses);
        } catch (error) {
            setError('Error fetching student courses');

        }
    };

    const calculateProgress = (studentId, majorId) => {
        console.log(studentId, majorId);
        console.log("calculate progress");
        // const studentCoursesForMajor = studentCourses.filter(course => course.student_id === studentId && course.major_id === majorId);
        // const major = majors.find(major => major.id === majorId);
        // if (!major) return 0;

        // const totalCourses = major.graduation_requirements.length;
        // let passedCourses = 0;

        // studentCoursesForMajor.forEach(course => {
        //     const requirement = major.graduation_requirements.find(req => req.course_id === course.course_id);
        //     if (requirement && course.grade >= requirement.grade) {
        //         passedCourses++;
        //     }
        // });

        // return (passedCourses / totalCourses) * 100;
        return 75;
    };

    return (
        <>
            {message && (
                <Alert status="success" mb={4}>
                    <AlertIcon />
                    {message}
                </Alert>
            )}
            {error && (
                <Alert status="error" mb={4}>
                    <AlertIcon />
                    {error}
                </Alert>
            )}

            <VStack spacing={4} align="stretch">
                <Accordion allowMultiple>
                    {students.length > 0 && students.map((student) => (
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
                                <Button onClick={() => handleViewProgress(student.moralis_provider_id)} size="sm">
                                    {viewingProgress === student.moralis_provider_id ? 'Hide Progress' : 'View Progress'}
                                </Button>
                                {viewingProgress === student.moralis_provider_id && student.majors && student.majors.map((majorId) => {
                                    const progress = calculateProgress(student.moralis_provider_id, majorId);
                                    const totalCourses = getTotalCourses(majorId);
                                    const major = majors.find(major => major.id === majorId);
                                    console.log("major: ", major);
                                    return (
                                        <Box key={majorId} mt={2}>
                                            {/* <Text>{majors.find(major => major.id === majorId)}</Text> */}
                                            <Text>{major ? major.name : 'Unknown Major'}</Text>
                                            <Progress value={progress} size="sm" colorScheme="green" />
                                            <Text>{`${Math.floor(progress)}% (${Math.floor(progress / 100 * totalCourses)} / ${totalCourses})`}</Text>
                                        </Box>
                                    );
                                })}
                                {viewingProgress === student.moralis_provider_id && student.majors && student.majors.every(majorId => calculateProgress(student.moralis_provider_id, majorId) === 100) && (
                                    <Button mt={4} colorScheme="teal">Mint Diploma</Button>
                                )}
                            </AccordionPanel>
                        </AccordionItem>
                    ))}
                </Accordion>
            </VStack>
        </>
    );
};

export default StudentProgress;