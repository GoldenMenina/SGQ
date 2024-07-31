// components/Layout.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  Stack,
  useToast,
  Icon,
  useBreakpointValue,
} from '@chakra-ui/react'
import { FiMenu } from 'react-icons/fi'
import { FiUser } from 'react-icons/fi'
import { FiBell } from 'react-icons/fi'
import { FiLogOut } from 'react-icons/fi'
import supabase from '../lib/supabaseClient'

const navLinks = [
  { label: 'Client Management', href: '/client-management' },
  { label: 'Sales Management', href: '/sales-management' },
  { label: 'Service Management', href: '/service-management' },
  { label: 'Employee Management', href: '/employee-management' },
  { label: 'Inventory Management', href: '/inventory-management' },
  { label: 'Billing and Payments', href: '/billing-payments' },
  { label: 'Reports and Analytics', href: '/reports-analytics' },
  { label: 'Settings and Configuration', href: '/settings-configuration' },
  { label: 'Support and Feedback', href: '/support-feedback' },
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
    return <Box>Loading...</Box>
  }

  return (
    <>
    {session &&(
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
          aria-label="Open Menu"
          onClick={onOpen}
          variant="outline"
          colorScheme="whiteAlpha"
        />
        <Flex align="center">
          <IconButton
            icon={<FiBell />}
            aria-label="Notifications"
            variant="outline"
            colorScheme="whiteAlpha"
            mr={4}
          />
          <IconButton
            icon={<FiUser />}
            aria-label="User Profile"
            variant="outline"
            colorScheme="whiteAlpha"
            mr={4}
          />
          <IconButton
            icon={<FiLogOut />}
            aria-label="Logout"
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
              <Stack spacing={4}>
                {navLinks.map((link) => (
                  <Button
                    key={link.href}
                    as="a"
                    href={link.href}
                    variant="outline"
                    width="100%"
                  >
                    {link.label}
                  </Button>
                ))}
              </Stack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
        
        <Box flex="1" p={4}>
          <Container maxW="container.lg" p={4}>
            {children}
          </Container>
        </Box>
      </Flex>
    </Flex>)}
    </>
  )
}

export default Layout