import React, { useState } from 'react';
import { Box, Button, Flex, Heading, Text, VStack } from '@chakra-ui/react';
import ManageMajors from '../ManageMajors';
import StudentsCourses from '../StudentCourses'
import StudentProgress from '../StudentProgress.js'
import Diploma from '../Diplomas.js';

function CollegeDashboard() {
    const [activePanel, setActivePanel] = useState('ManageMajors');


    return (
        <Flex className='CollegeDashboard'>
            <Box p="5" minWidth="20%" height="100vh" bg="gray.100">
                <VStack spacing={4} align="stretch">
                    <Button onClick={() => setActivePanel('ManageMajors')} colorScheme="teal">Manage Majors</Button>
                    <Button onClick={() => setActivePanel('StudentsCourses')} colorScheme="teal">Students & Courses</Button>
                    <Button onClick={() => setActivePanel('StudentProgress')} colorScheme="teal">Student Progress</Button>
                    <Button onClick={() => setActivePanel('Diplomas')} colorScheme="teal">Diplomas</Button>
                </VStack>
            </Box>
            <Box p="5" flex="1" bg="gray.50">
                <Heading mb="4">College Dashboard</Heading>
                <Text>Welcome, college admin! This is your dashboard.</Text>
                <Box mt="5" className="dashboard-content">
                    {activePanel === 'ManageMajors' && <ManageMajors />}
                    {activePanel === 'StudentsCourses' && <StudentsCourses />}
                    {activePanel === 'StudentProgress' && <StudentProgress />}
                    {activePanel === 'Diplomas' && <Diploma />}
                    {/* Add other components for other panels as needed */}
                </Box>
            </Box>
        </Flex>
    );
}

export default CollegeDashboard;
