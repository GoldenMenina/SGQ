// pages/login.js
import { useState } from 'react';
import { Box, Button, Center, FormControl, FormLabel, Heading, Input, Stack, useToast } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useEffect } from 'react'

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [session, setSession] = useState(null);
  const toast = useToast();
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/login', { email, password });
      if (response.data.success) {
        localStorage.setItem('session', JSON.stringify(response.data.user));
        router.push('/');
      } else {
        toast({
          title: 'Error',
          description: response.data.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  
  useEffect(() => {
    const checkSession = () => {
      const storedSession = localStorage.getItem('session');
      if (storedSession) {
        setSession(JSON.parse(storedSession));
      }
      setLoading(false);

      if (!storedSession && router.pathname === '/login') {
        router.push('/');
      }
    };

    checkSession();
  }, [router]);

  return (
    <Center minH="100vh" bg="gray.100">
      <Box bg="white" p={8} borderRadius="lg" boxShadow="lg" width="full" maxW="md">
        <Heading mb={6} textAlign="center">SGQ</Heading>
        <form onSubmit={handleLogin}>
          <Stack spacing={4}>
            <FormControl id="email" isRequired>
              <FormLabel>Email</FormLabel>
              <Input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu email" 
              />
            </FormControl>
            <FormControl id="password" isRequired>
              <FormLabel>Senha</FormLabel>
              <Input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha" 
              />
            </FormControl>
            <Button type="submit" colorScheme="teal" size="lg" fontSize="md">
              Entrar
            </Button>
          </Stack>
        </form>
      </Box>
    </Center>
  );
}

export default LoginPage;