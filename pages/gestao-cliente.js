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
  useDisclosure,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { supabase } from '../lib/supabaseClient';

const GestaoClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const itemsPerPage = 10; // Número de clientes por página

  useEffect(() => {
    fetchClientes();
  }, [currentPage]);

  const fetchClientes = async () => {
    const { data, error, count } = await supabase
      .from('clientes')
      .select('*', { count: 'exact' })
      .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

    if (error) {
      console.error('Erro ao buscar clientes:', error);
    } else {
      setClientes(data);
      setTotalPages(Math.ceil(count / itemsPerPage));
    }
  };

  const handleNovoCliente = () => {
    setSelectedCliente(null);
    onOpen();
  };

  const handleEditCliente = (cliente) => {
    setSelectedCliente(cliente);
    onOpen();
  };

  const handleDeleteCliente = async (id) => {
    const { error } = await supabase.from('clientes').delete().eq('id', id);
    if (error) {
      toast({
        title: 'Erro ao excluir cliente',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: 'Cliente excluído com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchClientes();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const clienteData = Object.fromEntries(formData.entries());

    if (selectedCliente) {
      // Editar cliente existente
      const { error } = await supabase
        .from('clientes')
        .update(clienteData)
        .eq('id', selectedCliente.id);

      if (error) {
        toast({
          title: 'Erro ao atualizar cliente',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Cliente atualizado com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      // Adicionar novo cliente
      const { error } = await supabase.from('clientes').insert(clienteData);

      if (error) {
        console.log(error)
        toast({
          title: 'Erro ao adicionar cliente',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Cliente adicionado com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    }

    onClose();
    fetchClientes();
  };

  return (
    <Container maxW="container.xl">
      <Box d="flex" alignItems="center" justifyContent="space-between" mb={5}>
        <Heading as="h1" size="xl">
          Gestão de Clientes
        </Heading>
        <Button leftIcon={<FiPlus />} colorScheme="teal" onClick={handleNovoCliente}>
          Novo Cliente
        </Button>
      </Box>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Nome</Th>
            <Th>NIF</Th>
            <Th>Email</Th>
            <Th>Telefone</Th>
            <Th>Ações</Th>
          </Tr>
        </Thead>
        <Tbody>
          {clientes.map((cliente) => (
            <Tr key={cliente.id}>
              <Td>{cliente.nome}</Td>
              <Td>{cliente.nif}</Td>
              <Td>{cliente.email}</Td>
              <Td>{cliente.telefone}</Td>
              <Td>
                <IconButton
                  icon={<FiEdit />}
                  aria-label="Editar"
                  mr={2}
                  onClick={() => handleEditCliente(cliente)}
                />
                <IconButton
                  icon={<FiTrash2 />}
                  aria-label="Excluir"
                  onClick={() => handleDeleteCliente(cliente.id)}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Box mt={4} d="flex" justifyContent="space-between">
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
          <ModalHeader>{selectedCliente ? 'Editar Cliente' : 'Novo Cliente'}</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <FormControl>
                <FormLabel>Nome</FormLabel>
                <Input name="nome" defaultValue={selectedCliente?.nome} />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>NIF</FormLabel>
                <Input name="nif" defaultValue={selectedCliente?.nif} />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Email</FormLabel>
                <Input name="email" type="email" defaultValue={selectedCliente?.email} />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Telefone</FormLabel>
                <Input name="telefone" defaultValue={selectedCliente?.telefone} />
              </FormControl>
              {/* Adicione mais campos conforme necessário */}
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} type="submit">
                Salvar
              </Button>
              <Button onClick={onClose}>Cancelar</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default GestaoClientes;