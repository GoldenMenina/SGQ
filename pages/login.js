// pages/login.js
import { Box, Button, Center, FormControl, FormLabel, Heading, Input, Stack, useToast } from '@chakra-ui/react'
import supabase from '../lib/supabaseClient'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

function LoginPage() {
  const toast = useToast()
  const router = useRouter()

  useEffect(() => {
    // Redirect authenticated users away from the login page
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/') // Redirect to homepage or another page
      }
    }

    checkAuth()
  }, [router])

  const handleLogin = async (e) => {
    e.preventDefault()
    const email = e.target.email.value
    const password = e.target.password.value

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast({
        title: 'Erro',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } else {
      router.push('/') // Redirect to homepage or another page after successful login
    }
  }

  return (
    <Center minH="100vh" bg="gray.100">
      <Box bg="white" p={8} borderRadius="lg" boxShadow="lg" width="full" maxW="md">
        <Heading mb={6} textAlign="center">SGQ</Heading>
        <form onSubmit={handleLogin}>
          <Stack spacing={4}>
            <FormControl id="email" isRequired>
              <FormLabel>Email</FormLabel>
              <Input type="email" name="email" placeholder="Digite seu email" />
            </FormControl>
            <FormControl id="password" isRequired>
              <FormLabel>Senha</FormLabel>
              <Input type="password" name="password" placeholder="Digite sua senha" />
            </FormControl>
            <Button type="submit" colorScheme="teal" size="lg" fontSize="md">
              Entrar
            </Button>
          </Stack>
        </form>
      </Box>
    </Center>
  )
}

export default LoginPage