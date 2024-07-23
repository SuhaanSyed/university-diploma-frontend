// ManageMajors.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ManageCourses from './ManageCourses'; // Adjust the path as necessary
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
    HStack,
    Heading,
    Input,
    useToast,
    FormControl,
    FormLabel,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, ViewIcon } from '@chakra-ui/icons';

const ManageMajors = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();
    const [majors, setMajors] = useState([]);
    const [newMajor, setNewMajor] = useState('');
    const [courseRequirements, setCourseRequirements] = useState([]);
    const [message, setMessage] = useState('');
    // const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
    // const [currentMajorName, setCurrentMajorName] = React.useState('');
    const [currentMajor, setCurrentMajor] = useState(null); // State to hold the current major's courses
    const [isViewCoursesModalOpen, setIsViewCoursesModalOpen] = useState(false);


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
            console.log('Course Requirements:', courseRequirements);
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

    const handleViewCoursesClick = (major) => {
        setCurrentMajor(major);
        setIsViewCoursesModalOpen(true);
    };


    return (
        <>
            <Heading mb={6}>Manage Majors</Heading>
            <Accordion allowToggle>
                {majors.map((major, index) => (
                    <AccordionItem key={index}>
                        <h2>
                            <AccordionButton>
                                <Box flex="1" textAlign="left">
                                    {major.name}
                                </Box>
                                <AccordionIcon />
                            </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                            {/* Major details and options here */}
                            <HStack justifyContent="space-between">
                                <IconButton aria-label="Edit Major" icon={<EditIcon />} onClick={() => { handleEditMajor(major.name, major.name, courseRequirements) }} />
                                <IconButton aria-label="Delete Major" icon={<DeleteIcon />} onClick={() => { handleDeleteMajor(major.name) }} />
                            </HStack>
                            {/* Courses list or modal trigger */}
                        </AccordionPanel>
                        <AccordionPanel pb={4}>
                            {/* Major options */}
                            <Button leftIcon={<ViewIcon />} onClick={() => handleViewCoursesClick(major)}>
                                View Courses
                            </Button>
                            {/* Courses list or modal trigger */}
                        </AccordionPanel>

                    </AccordionItem>
                ))}
            </Accordion>

            <Modal isOpen={isViewCoursesModalOpen} onClose={() => setIsViewCoursesModalOpen(false)} scrollBehavior="inside">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{currentMajor ? currentMajor.name : ''} - Courses and Grades</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Table variant="simple">
                            <Thead>
                                <Tr>
                                    <Th>Course</Th>
                                    <Th>Grade Requirement</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {currentMajor?.graduation_requirements?.map((course, index) => (
                                    <Tr key={index}>
                                        <Td>{course.name}</Td>
                                        <Td>{course.grade}</Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </ModalBody>
                </ModalContent>
            </Modal>

            <IconButton
                aria-label="Add Major"
                icon={<AddIcon />}
                isRound
                size="lg"
                colorScheme="teal"
                position="fixed"
                bottom="20px"
                right="20px"
                onClick={onOpen}
            />

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add a New Major</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {/* Form for new major */}
                        <FormControl>
                            <FormLabel>Major Name</FormLabel>
                            <Input value={newMajor} onChange={(e) => setNewMajor(e.target.value)} />
                            {/* Dynamically add course inputs */}
                            <ManageCourses
                                courseRequirements={courseRequirements}
                                setCourseRequirements={setCourseRequirements} />
                        </FormControl>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={handleAddMajor}>
                            Save
                        </Button>
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}

export default ManageMajors;