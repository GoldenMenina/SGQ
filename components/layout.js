// components/Layout.js
import { useEffect, useState } from 'react'
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
  { label: 'Gestão de Clientes', href: '/client-management', icon: faUsers },
  { label: 'Gestão de Vendas', href: '/sales-management', icon: faChartLine },
  { label: 'Gestão de Serviços', href: '/service-management', icon: faClipboardList },
  { label: 'Gestão de Funcionários', href: '/employee-management', icon: faUserTie },
  { label: 'Gestão de Estoque', href: '/inventory-management', icon: faBoxes },
  { label: 'Faturamento e Pagamentos', href: '/billing-payments', icon: faFileInvoiceDollar },
  { label: 'Relatórios e Análises', href: '/reports-analytics', icon: faChartBar },
  { label: 'Configurações', href: '/settings-configuration', icon: faCog },
  { label: 'Suporte e Feedback', href: '/support-feedback', icon: faLifeRing },
]

const Layout = ({ children }) => {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setLoading(false)

      if (!session && router.pathname !== '/login') {
        router.push('/login')
      }
      if (session && router.pathname === '/login') {
        router.push('/')
      }
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session)
      if (!session && router.pathname !== '/login') {
        router.push('/login')
      } else if (session && router.pathname === '/login') {
        router.push('/')
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [router])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast({
        title: 'Erro',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } else {
      router.push('/login')
    }
  }

  if (loading) {
    return <Box>Carregando...</Box>
  }

  return (
    <>
    { session ? (
    <Flex direction="column" minH="100vh">
      <Flex
        as="header"
        bg="teal.500"
        color="white"
        p={4}
        align="center"
        justify="space-between"
      >
        <IconButton
          icon={<FiMenu />}
          aria-label="Abrir Menu"
          onClick={onOpen}
          variant="outline"
          colorScheme="whiteAlpha"
        />
        <Flex align="center">
          <IconButton
            icon={<FiBell />}
            aria-label="Notificações"
            variant="outline"
            colorScheme="whiteAlpha"
            mr={4}
          />
          <IconButton
            icon={<FiUser />}
            aria-label="Perfil do Usuário"
            variant="outline"
            colorScheme="whiteAlpha"
            mr={4}
          />
          <IconButton
            icon={<FontAwesomeIcon icon={faPowerOff} />}
            aria-label="Sair"
            onClick={handleLogout}
            variant="outline"
            colorScheme="whiteAlpha"
          />
        </Flex>
      </Flex>

      <Flex flex="1">
     <Drawer isOpen={isOpen} onClose={onClose} placement="left">
              <DrawerOverlay />
              <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader>Menu</DrawerHeader>
                <DrawerBody>
                  <VStack align="stretch" spacing={2}>
                    {navLinks.map((link) => (
                      <Button
                        key={link.href}
                        as="a"
                        href={link.href}
                        variant="ghost"
                        justifyContent="flex-start"
                        fontWeight="normal"
                        borderRadius="0"
                        _hover={{ bg: 'gray.100' }}
                        _active={{ bg: 'gray.200' }}
                        leftIcon={<FontAwesomeIcon icon={link.icon} />}
                      >
                        {link.label}
                      </Button>
                    ))}
                  </VStack>
                </DrawerBody>
              </DrawerContent>
            </Drawer>    
        <Box flex="1" p={4}>
          <Container maxW="container.lg" p={4}>
            {children}
          </Container>
        </Box>
      </Flex>
    </Flex> ) : (children) } </>
  )
}

export default Layout