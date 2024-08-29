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
  Badge,
  VStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react'
import { FiMenu, FiBell, FiCalendar } from 'react-icons/fi'
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
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [upcomingPickups, setUpcomingPickups] = useState([])
  const router = useRouter()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const getDaysUntilPickupText = (days) => {
    switch (days) {
      case 0:
        return "Hoje";
      case 1:
        return "Amanhã";
      case 2:
        return "Em 2 dias";
      case 3:
        return "Em 3 dias";
      default:
        return `Em ${days} dias`;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'proforma':
        return 'yellow.500';
      case 'factura':
        return 'green.500';
      default:
        return 'gray.500';
    }
  };

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

  useEffect(() => {
    const fetchLowStockProducts = async () => {
      try {
        const response = await fetch('/api/produtos/low-stock-products');
        if (response.ok) {
          const products = await response.json();
          setLowStockProducts(products);
        } else {
          console.error('Failed to fetch low stock products');
        }
      } catch (error) {
        console.error('Error fetching low stock products:', error);
      }
    };

    const fetchUpcomingPickups = async () => {
      try {
        const response = await fetch('/api/facturacao/upcoming-pickups');
        if (response.ok) {
          const pickups = await response.json();
          setUpcomingPickups(pickups);
        } else {
          console.error('Failed to fetch upcoming pickups');
        }
      } catch (error) {
        console.error('Error fetching upcoming pickups:', error);
      }
    };

    if (session) {
      fetchLowStockProducts();
      fetchUpcomingPickups();
    }
  }, [session]);

  const handleLogout = async () => {
    try {
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
            <Menu>
                <Box position="relative">
                  <MenuButton
                    as={IconButton}
                    icon={<FiCalendar />}
                    aria-label="Notificações de Recolhas"
                    variant="outline"
                    colorScheme="whiteAlpha"
                    size="sm"
                  />
                  {upcomingPickups.length > 0 && (
                    <Badge
                      position="absolute"
                      top="-3px"
                      right="-2px"
                      colorScheme="orange"
                      borderRadius="full"
                      fontSize="0.8em"
                      minWidth="1.6em"
                      height="1.6em"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontWeight="bold"
                    >
                      {upcomingPickups.length}
                    </Badge>
                  )}
                </Box>
                <MenuList>
                  {upcomingPickups.length > 0 ? (
                    upcomingPickups.map((pickup) => (
                      <MenuItem key={pickup._id}>
                        <VStack align="start" spacing={1}>
                          <Text color="black" fontWeight="bold">{pickup.cliente.nome}</Text>
                          <Text color="gray.600">Tel: {pickup.cliente.telefone}</Text>
                          <HStack>
                            <Text color="blue.500" fontWeight="bold">
                              {getDaysUntilPickupText(pickup.daysUntilPickup)}
                            </Text>
                            <Badge colorScheme={getStatusColor(pickup.status)}>
                              {pickup.status}
                            </Badge>
                          </HStack>
                          <Text color="gray.600">Data: {pickup.data}</Text>
                          <Text color="gray.600">Itens: {pickup.itens.map(item => item.nome).join(', ')}</Text>
                        </VStack>
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem>
                      <Text color="black">Nenhuma recolha próxima</Text>
                    </MenuItem>
                  )}
                </MenuList>
              </Menu>
              <Menu>
              <Box position="relative">
                  <MenuButton
                    as={IconButton}
                    icon={<FiBell />}
                    aria-label="Notificações de Estoque Baixo"
                    variant="outline"
                    colorScheme="whiteAlpha"
                    size="sm"
                  />
                  {lowStockProducts.length > 0 && (
                    <Badge
                      position="absolute"
                      top="-3px"
                      right="-2px"
                      colorScheme="red"
                      borderRadius="full"
                      fontSize="0.8em"
                      minWidth="1.6em"
                      height="1.6em"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontWeight="bold"
                    >
                      {lowStockProducts.length}
                    </Badge>
                  )}
                </Box>
                <MenuList>
                  {lowStockProducts.length > 0 ? (
                    lowStockProducts.map((product) => (
                      <MenuItem key={product._id}>
                        <Text color="black">{product.nome}</Text>
                        <Text color="red" ml={2}>
                          Restam: {product.quantidade}
                        </Text>
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem>
                      <Text color="black">Nenhum produto com estoque baixo</Text>
                    </MenuItem>
                  )}
                </MenuList>
              </Menu>
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


