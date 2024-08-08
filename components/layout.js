// components/Layout.js
import { useEffect, useState } from 'react'
import Link from "next/link";
import { useRouter } from 'next/router'
import {
  Box,
  Container,
  Flex,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  Button,
  Text,
  useToast,
  HStack,
  VStack,
} from '@chakra-ui/react'
import { FiMenu, FiUser, FiBell } from 'react-icons/fi'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPowerOff,
  faUsers,
  faChartLine,
  faClipboardList,
  faUserTie,
  faBoxes,
  faFileInvoiceDollar,
  faChartBar,
  faCog,
  faLifeRing
} from '@fortawesome/free-solid-svg-icons'
import supabase from '../lib/supabaseClient'

const navLinks = [
  { label: 'Gestão de Clientes', href: '/gestao-cliente', icon: faUsers },

  { label: 'Gestão de Serviços', href: '/gestao-servico', icon: faClipboardList },
  { label: 'Gestão de Funcionários', href: '/gestao-funcionarios', icon: faUserTie },
  { label: 'Gestão de Produtos', href: '/gestao-produtos', icon: faBoxes },
  { label: 'Faturamento e Pagamentos', href: '/facturacaopagamento', icon: faFileInvoiceDollar },
  { label: 'Gráficos e Análises', href: '/', icon: faChartBar },
  { label: 'Configurações da Empresa', href: '/empresa', icon: faCog },
  
]



const Layout = ({ children }) => {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  useEffect(() => {
    const checkSession = () => {
      const storedSession = localStorage.getItem('session');
      if (storedSession) {
        setSession(JSON.parse(storedSession));
      }
      setLoading(false);

      if (!storedSession && router.pathname !== '/login') {
        router.push('/login');
      }
    };

    checkSession();
  }, [router]);


  const handleLogout = async () => {
    try {;
      localStorage.removeItem('session');
      setSession(null);
      router.push('/login');
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Failed to logout',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return <Box>Carregando...</Box>
  }

return (
    <>
      {session ? (
        <Flex direction="column" minH="100vh">
          <Flex
            as="header"
            bg="teal.500"
            color="white"
            p={4}
            align="center"
            justify="space-between"
            width="100%"
            position="fixed"
            top={0}
            zIndex={1000}
          >
            <IconButton
              icon={<FiMenu />}
              aria-label="Abrir Menu"
              onClick={onOpen}
              variant="outline"
              colorScheme="whiteAlpha"
            />
            <HStack spacing={2}>
              <IconButton
                icon={<FiBell />}
                aria-label="Notificações"
                variant="outline"
                colorScheme="whiteAlpha"
                size="sm"
              />
              <IconButton
                icon={<FiUser />}
                aria-label="Perfil do Usuário"
                variant="outline"
                colorScheme="whiteAlpha"
                size="sm"
              />
              <IconButton
                icon={<FontAwesomeIcon icon={faPowerOff} />}
                aria-label="Sair"
                onClick={handleLogout}
                variant="outline"
                colorScheme="whiteAlpha"
                size="sm"
              />
            </HStack>
          </Flex>

          <Flex flex="1" mt="60px">
            <Drawer isOpen={isOpen} onClose={onClose} placement="left">
              <DrawerOverlay />
              <DrawerContent >
                <DrawerCloseButton />
                <DrawerHeader>Menu</DrawerHeader>
                <DrawerBody>
                  <VStack align="stretch" spacing={2}>
                    {navLinks.map((link) => (
                    <Link href={link.href} >
                    <>
                      <Button
                        key={link.href}
                        as="a"
                        onClick={onClose}
                        href="#"
                        variant="ghost"
                        justifyContent="flex-start"
                        fontWeight="normal"
                        borderRadius="0"
                        _hover={{ bg: 'gray.100' }}
                        _active={{ bg: 'gray.200' }}
                        leftIcon={<FontAwesomeIcon icon={link.icon} />}
                        width="100%"
                      >
                        {link.label}
                      </Button>
                      </>
                      </Link>
                    ))}
                  </VStack>
                </DrawerBody>
              </DrawerContent>
            </Drawer>
            
            <Box flex="1" p={4} width="100%">
              <Container maxW="container.xl" p={4}>
                {children}
              </Container>
            </Box>
          </Flex>
        </Flex>
      ) : (
        children
      )}
    </>
  )
}

export default Layout


