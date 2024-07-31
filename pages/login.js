// pages/login.js
import {
  Box,
  Button,
  Center,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react'

function LoginPage() {
  const toast = useToast()

  const handleLogin = (e) => {
    e.preventDefault()
    // Handle login logic here
    toast({
      title: 'Login bem-sucedido.',
      description: 'Você fez login com sucesso.',
      status: 'success',
      duration: 5000,
      isClosable: true,
    })
  }

  return (
    <Center minH="100vh" bg="gray.100">
      <Box
        bg="white"
        p={8}
        borderRadius="lg"
        boxShadow="lg"
        width="full"
        maxW="md"
      >
        <Heading mb={6} textAlign="center">
          SGQ
        </Heading>
        <form onSubmit={handleLogin}>
          <Stack spacing={4}>
            <FormControl id="email" isRequired>
              <FormLabel>Email</FormLabel>
              <Input type="email" placeholder="Digite seu email" />
            </FormControl>
            <FormControl id="password" isRequired>
              <FormLabel>Senha</FormLabel>
              <Input type="password" placeholder="Digite sua senha" />
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