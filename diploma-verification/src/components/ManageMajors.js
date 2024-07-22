// ManageMajors.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Box,
    Button,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    IconButton,
    VStack,
    HStack,
    Input,
    useToast,
    Text,
    FormControl,
    FormLabel,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';

const ManageMajors = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
    const [majors, setMajors] = useState([]);
    const [newMajor, setNewMajor] = useState('');
    const [courseRequirements, setCourseRequirements] = useState([]);
    const [newCourse, setNewCourse] = useState({ name: '', grade: '' });
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchMajors();
    }, []);

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

    const handleAddMajor = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:3002/api/majors', {
                name: newMajor,
                graduationRequirements: courseRequirements,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log(response);
            setMessage(`Major added: ${response.data[0].name}`);
            for (let i = 0; i < courseRequirements.length; i++) {
                console.log(courseRequirements[i].name);
                try {
                    const res = await axios.post('http://localhost:3002/api/courses', {
                        name: courseRequirements[i].name,
                        majorId: response.data[0].id,
                    }, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                } catch (error) {
                    setMessage(`Error adding course: ${error.message}`);
                }

            }
            setNewMajor('');
            setCourseRequirements([]);
            fetchMajors();
        } catch (error) {
            setMessage(`Error adding major: ${error.message}`);
        }
    };

    const handleDeleteMajor = async (name) => {
        try {
            const token = localStorage.getItem('token');
            const major = majors.find((major) => major.name === name);
            if (!major) {
                setMessage(`Major not found: ${name}`);
                return;
            }
            const majorId = major.id;

            try {


                // Delete courses for the major
                await axios.delete(`http://localhost:3002/api/courses/majors/${majorId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            } catch (error) {
                setMessage(`Error deleting courses for major: ${error.message}`);
            }


            await axios.delete(`http://localhost:3002/api/majors/${majorId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setMessage(`Major deleted: ${name}`);
            fetchMajors();
        } catch (error) {
            setMessage(`Error deleting major: ${error.message}`);
        }
    };

    const handleEditMajor = async (oldName, newName, newGraduationRequirements) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:3002/api/majors/${oldName}`, {
                newName,
                graduationRequirements: newGraduationRequirements,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setMessage(`Major updated: ${newName}`);
            fetchMajors();
        } catch (error) {
            setMessage(`Error updating major: ${error.message}`);
        }
    };

    const handleAddCourse = () => {
        setCourseRequirements([...courseRequirements, newCourse]);
        setNewCourse({ name: '', grade: 0 });
    };

    const handleCourseChange = (e) => {
        const { name, value } = e.target;
        setNewCourse((prevCourse) => ({
            ...prevCourse,
            [name]: name === 'grade' ? Number(value) : value
        }));
    };

    return (
        <div>
            <h1>Manage Majors</h1>
            <div>
                <h3>Add Major</h3>
                <input
                    type="text"
                    value={newMajor}
                    onChange={(e) => setNewMajor(e.target.value)}
                    placeholder="New Major"
                />
                <h4>Course Requirements</h4>
                <input
                    type="text"
                    name="name"
                    value={newCourse.name}
                    onChange={handleCourseChange}
                    placeholder="Course Name"
                />
                <input
                    type="number"
                    name="grade"
                    value={newCourse.grade}
                    onChange={handleCourseChange}
                    placeholder="Grade"
                />
                <button onClick={handleAddCourse}>Add Course</button>
                <button onClick={handleAddMajor}>Add Major</button>
            </div>
            <div>
                <h3>Current Majors</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Major</th>
                            <th>Courses</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {majors.map((major) => (
                            <tr key={major.name}>
                                <td>{major.name}</td>
                                <td>
                                    <button onClick={() => setMajors(majors.map(m => m.name === major.name ? { ...m, showCourses: !m.showCourses } : m))}>
                                        {major.showCourses ? 'Hide Courses' : 'Show Courses'}
                                    </button>
                                    {major.showCourses && (
                                        <ul>
                                            {major.graduation_requirements.map((course, index) => (
                                                <li key={index}>
                                                    {course.name} - {course.grade}
                                                    <button onClick={() => handleEditMajor(major.name, major.name, major.graduation_requirements.filter((_, i) => i !== index))}>Delete Grade</button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </td>
                                <td>
                                    <button onClick={() => handleDeleteMajor(major.name)}>Delete</button>
                                    <button onClick={() => handleEditMajor(major.name, prompt("New Major Name", major.name), major.graduation_requirements)}>Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ManageMajors;
