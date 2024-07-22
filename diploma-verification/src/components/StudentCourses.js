import React, { useState, useEffect } from 'react';
import axios from 'axios';

import {
    Box,
    Button,
    Heading,
    Input,
    Select,
    Text,
    VStack,
    HStack,
    List,
    ListItem,
    Collapse,
    useDisclosure,
    Alert,
    AlertIcon
} from '@chakra-ui/react';


const StudentsCourses = () => {
    const [students, setStudents] = useState([]);
    const [majors, setMajors] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedMajor, setSelectedMajor] = useState('');
    const [studentCourses, setStudentCourses] = useState([]);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchStudents();
        //fetchMajors();
    }, []);

    useEffect(() => {
        fetchMajors();
    }, []);

    useEffect(() => {
        if (selectedMajor) {
            fetchCoursesForMajor(selectedMajor);
        }
    }, [selectedMajor]);

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

    const fetchCoursesForMajor = async (majorId) => {
        try {
            console.log(majorId);
            const response = await axios.get(`http://localhost:3002/api/majors/${majorId}/courses`);
            setStudentCourses(response.data);
        } catch (error) {
            setError('Error fetching courses for major');
        }
    };

    const fetchStudentCourses = async (studentId) => {
        try {
            const response = await axios.get(`http://localhost:3002/api/student_courses/${studentId}`);
            setStudentCourses(response.data);
        } catch (error) {
            setError('Error fetching student courses');
        }
    };

    const handleMajorChange = async (studentId, majorId) => {
        try {
            const response = await axios.put(`http://localhost:3002/api/student_majors`, { studentId, majorId });
            console.log(response);
            setMessage('Major updated successfully');
            fetchStudents(); // Refresh the student list
            if (selectedStudent && selectedStudent.moralis_provider_id === studentId) {
                fetchStudentCourses(studentId);
            }
        } catch (error) {
            setError('Error updating student major');
        }


    };

    const handleStudentSelect = (student) => {
        setSelectedStudent(student);
        // Fetch student's current courses and grades
        fetchStudentCourses(student.moralis_provider_id);
    };



    const handleGradeChange = (courseId, grade) => {
        setStudentCourses((prevCourses) =>
            prevCourses.map((course) =>
                course.course_id === courseId ? { ...course, grade } : course
            )
        );
    };

    const handleSaveGrades = async () => {
        try {
            await axios.put(`http://localhost:3002/api/student_courses/${selectedStudent.moralis_provider_id}`, studentCourses);
            setSelectedStudent(null); // Deselect student
            fetchStudents(); // Refresh student list
        } catch (error) {
            setError('Error saving grades');
        }
    };

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        (student.major && student.major.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <Box p={5}>
            <Heading mb={6}>Students & Courses</Heading>
            <Input
                placeholder="Search by student name or major"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                mb={4}
            />
            {error && (
                <Alert status="error" mb={4}>
                    <AlertIcon />
                    {error}
                </Alert>
            )}
            <VStack spacing={4} align="stretch">
                <Heading size="md">Students</Heading>
                <List spacing={3}>
                    {filteredStudents.map((student) => (
                        <ListItem key={student.moralis_provider_id} border="1px" borderRadius="md" p={3}>
                            <HStack justify="space-between">
                                <Text>{student.name} - Major: {selectedMajor || 'None'}</Text>
                                <Button onClick={() => handleStudentSelect(student)} size="sm">View Details</Button>
                            </HStack>
                            <Select
                                value={student.majorId || ''}
                                onChange={(e) => handleMajorChange(student.moralis_provider_id, e.target.value)}
                                mt={2}
                            >
                                <option value="">Select Major</option>
                                {majors.map((major) => (
                                    <option key={major.id} value={major.id}>{major.name}</option>
                                ))}
                            </Select>
                        </ListItem>
                    ))}
                </List>
                {selectedStudent && (
                    <Box mt={6} p={4} border="1px" borderRadius="md">
                        <Heading size="md">{selectedStudent.name}'s Courses</Heading>
                        <List spacing={3} mt={4}>
                            {studentCourses.map((course) => (
                                <ListItem key={course.course_id}>
                                    <HStack>
                                        console.log(course.name);
                                        <Text>{course.name}</Text>
                                        <Input
                                            placeholder="Grade"
                                            value={course.grade || ''}
                                            onChange={(e) => handleGradeChange(course.course_id, e.target.value)}
                                            width="80px"
                                        />
                                    </HStack>
                                </ListItem>
                            ))}
                        </List>
                        <Button mt={4} onClick={handleSaveGrades}>Save Grades</Button>
                    </Box>
                )}
            </VStack>
        </Box>
    );
};

export default StudentsCourses;