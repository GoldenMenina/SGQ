import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  useDisclosure,

  IconButton,
  useToast,
} from '@chakra-ui/react';
import { FiPlus, FiEdit,FiSearch, FiTrash2 } from 'react-icons/fi';
import axios from 'axios';
import { getSession } from '../lib/session';

const GestaoFuncionarios = () => {
  const [funcionarios, setFuncionarios] = useState([]);
  const [selectedFuncionario, setSelectedFuncionario] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [user, setUser] = useState(null);

  useEffect(() => {
    const userSession = getSession();
    if (userSession) {
      setUser(userSession);
    }
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;
  useEffect(() => {
    fetchFuncionarios();
  }, [currentPage,searchTerm]);

  const fetchFuncionarios = async () => {
    try {
      const response = await axios.get(`/api/funcionarios?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}`);
      setFuncionarios(response.data.funcionarios);
      setTotalPages(Math.ceil(response.data.total / itemsPerPage));
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
      toast({
        title: 'Erro ao buscar funcionários',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleNovoFuncionario = () => {
    setSelectedFuncionario(null);
    onOpen();
  };

  const handleEditFuncionario = (funcionario) => {
    setSelectedFuncionario(funcionario);
    onOpen();
  };

  const handleDeleteFuncionario = async (id) => {
    try {
      await axios.delete(`/api/funcionarios/${id}`);
      toast({
        title: 'Funcionarios excluído com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchFuncionarios();
    } catch (error) {
      toast({
        title: 'Erro ao excluir funcionario',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.target);
    const funcionarioData = Object.fromEntries(formData.entries());

    try {
      if (selectedFuncionario) {
        await axios.put(`/api/funcionarios/${selectedFuncionario._id}`, funcionarioData);
        toast({
          title: 'Funcionário atualizado com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await axios.post('/api/funcionarios', funcionarioData);
        toast({
          title: 'Funcionário adicionado com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      onClose();
      fetchFuncionarios();
    } catch (error) {
      console.error(error);
      toast({
        title: `Erro ao ${selectedFuncionario ? 'atualizar' : 'adicionar'} funcionário`,
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.xl">
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={5}>
        <Heading as="h1" size="xl">
          Gestão de Funcionários
        </Heading>
        <Button leftIcon={<FiPlus />} colorScheme="teal" onClick={handleNovoFuncionario}>
          Novo Funcionário
        </Button>
      </Box>
      
      
<InputGroup mb={5}>
        <InputLeftElement pointerEvents="none" children={<FiSearch color="gray.300" />} />
        <Input
          type="text"
          placeholder="Buscar por nome, email ou NIF"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </InputGroup>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Nome</Th>
            <Th>Email</Th>
            <Th>Telefone</Th>
            <Th>Nível de Acesso</Th>
            <Th>Ações</Th>
          </Tr>
        </Thead>
        <Tbody>
          {funcionarios && funcionarios.map((funcionario) => (
          funcionario.email == 'ragy@sgq.ao' ? '' :(<>  <Tr key={funcionario._id}>
              <Td>{funcionario.nome}</Td>
              <Td>{funcionario.email}</Td>
              <Td>{funcionario.telefone}</Td>
              <Td>{funcionario.nivel_acesso}</Td>
              <Td>{user&&user.nivel_acesso === 'admin' &&(<> <IconButton
                  icon={<FiEdit />}
                  aria-label="Editar"
                  mr={2}
                  onClick={() => handleEditFuncionario(funcionario)}
                />
                <IconButton
                  icon={<FiTrash2 />}
                  aria-label="Excluir"
                  onClick={() => handleDeleteFuncionario(funcionario._id)}
                /></>)}
               
              </Td>
            </Tr>
        </>)
            ))}
        </Tbody>
      </Table>

      <Box mt={4} display="flex" justifyContent="space-between">
        <Button
          onClick={() => setCurrentPage(currentPage - 1)}
          isDisabled={currentPage === 1}
        >
          Anterior
        </Button>
        <Button
          onClick={() => setCurrentPage(currentPage + 1)}
          isDisabled={currentPage === totalPages}
        >
          Próxima
        </Button>
      </Box>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedFuncionario ? 'Editar Funcionário' : 'Novo Funcionário'}</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <FormControl>
                <FormLabel>Nome</FormLabel>
                <Input name="nome" defaultValue={selectedFuncionario?.nome} required />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Email</FormLabel>
                <Input name="email" type="email" defaultValue={selectedFuncionario?.email} required />
              </FormControl>
              {!selectedFuncionario && (
                <FormControl mt={4}>
                  <FormLabel>Senha</FormLabel>
                  <Input name="password" type="password" required />
                </FormControl>
              )}
              <FormControl mt={4}>
                <FormLabel>Telefone</FormLabel>
                <Input name="telefone" defaultValue={selectedFuncionario?.telefone} />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Endereço</FormLabel>
                <Input name="endereco" defaultValue={selectedFuncionario?.endereco} />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Nível de Acesso</FormLabel>
                <Select name="nivel_acesso" defaultValue={selectedFuncionario?.nivel_acesso} required>
                  <option value="admin">Admin</option>
                  <option value="funcionario">Funcionário</option>
                </Select>
              </FormControl>
            </ModalBody>
            <ModalFooter>
              {loading ? (
                <Button colorScheme="blue" mr={3} disabled>
                  Aguarde
                </Button>
              ) : (
                <Button colorScheme="blue" mr={3} type="submit">
                  Salvar
                </Button>
              )}
              <Button onClick={onClose}>Cancelar</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default GestaoFuncionarios;