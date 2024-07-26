import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ChakraProvider, Box, Flex, Text, Button, IconButton } from '@chakra-ui/react';
import { HamburgerIcon } from '@chakra-ui/icons';
import './assets/styles/App.css';
import TestAPI from './TestApi';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboards/Dashboard';
import { AmoyProvider } from './components/Auth/AmoyContext';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <ChakraProvider>
      <Router>
        <AmoyProvider>
          <Box className='App'>
            <Flex justifyContent="space-between" alignItems="center" bg="teal.500" p={4} color="white">
              <Text fontSize="xl">DApp</Text>
              <Flex>
                {isLoggedIn ? (
                  <>
                    <Link to="/dashboard">
                      <Button colorScheme="teal" variant="ghost">Dashboard</Button>
                    </Link>
                    <Link to="/testapi">
                      <Button colorScheme="teal" variant="ghost">TestAPI</Button>
                    </Link>
                    <IconButton
                      aria-label="User settings"
                      icon={<HamburgerIcon />}
                      variant="ghost"
                      onClick={() => console.log('User settings placeholder')}
                    />
                  </>
                ) : (
                  <>
                    <Link to="/login">
                      <Button colorScheme="teal" variant="ghost">Login</Button>
                    </Link>
                    <Link to="/register">
                      <Button colorScheme="teal" variant="ghost">Register</Button>
                    </Link>
                  </>
                )}
              </Flex>
            </Flex>
            <Routes>
              <Route path="/" element={<Text fontSize="2xl" p={5}>Welcome to the Diploma Verification DApp</Text>} />
              <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
              <Route path="/register" element={<Register setIsLoggedIn={setIsLoggedIn} />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/testapi" element={<TestAPI />} />
            </Routes>
          </Box>
        </AmoyProvider>
      </Router>
    </ChakraProvider>
  );
}

export default App;