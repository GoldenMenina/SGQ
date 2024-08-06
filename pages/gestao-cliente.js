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
  Select,
  Textarea,
  useDisclosure,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import supabase  from '../lib/supabaseClient';
import axios from 'axios'

const GestaoClientes = () => {
  
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const itemsPerPage = 10;

  useEffect(() => {
    fetchClientes();
  }, [currentPage]);

  const fetchClientes = async () => {
    try {
      const response = await axios.get(`/api/clientes?page=${currentPage}&limit=${itemsPerPage}`);
      setClientes(response.data.clientes);
      setTotalPages(Math.ceil(response.data.total / itemsPerPage));
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      toast({
        title: 'Erro ao buscar clientes',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
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
    try {
      await axios.delete(`/api/clientes/${id}`);
      toast({
        title: 'Cliente excluído com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchClientes();
    } catch (error) {
      toast({
        title: 'Erro ao excluir cliente',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSubmit = async (event) => {
    setLoading(true)
    event.preventDefault();
    const formData = new FormData(event.target);
    const clienteData = Object.fromEntries(formData.entries());

    try {
      if (selectedCliente) {
        await axios.put(`/api/clientes/${selectedCliente._id}`, clienteData);
        toast({
          title: 'Cliente atualizado com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await axios.post('/api/clientes', clienteData);
        toast({
          title: 'Cliente adicionado com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      onClose();
      fetchClientes();
      setLoading(false)
    } catch (error) {
      console.error(error);
      toast({
        title: `Erro ao ${selectedCliente ? 'atualizar' : 'adicionar'} cliente`,
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.xl">
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={5}>
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
            <Tr key={cliente._id}>
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
                  onClick={() => handleDeleteCliente(cliente._id)}
                />
              </Td>
            </Tr>
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
          <ModalHeader>{selectedCliente ? 'Editar Cliente' : 'Novo Cliente'}</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <FormControl>
                <FormLabel>Nome</FormLabel>
                <Input name="nome" defaultValue={selectedCliente?.nome} required />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>NIF</FormLabel>
                <Input name="nif" defaultValue={selectedCliente?.nif} required />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Email</FormLabel>
                <Input name="email" type="email" defaultValue={selectedCliente?.email} />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Telefone</FormLabel>
                <Input name="telefone" defaultValue={selectedCliente?.telefone} />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Endereço</FormLabel>
                <Input name="endereco" defaultValue={selectedCliente?.endereco} />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Cidade</FormLabel>
                <Input name="cidade" defaultValue={selectedCliente?.cidade} />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Código Postal</FormLabel>
                <Input name="codigo_postal" defaultValue={selectedCliente?.codigo_postal} />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>País</FormLabel>
                <Input name="pais" defaultValue={selectedCliente?.pais} />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Tipo de Cliente</FormLabel>
                <Select name="tipo_cliente" defaultValue={selectedCliente?.tipo_cliente}>
                  <option value="individual">Individual</option>
                  <option value="empresa">Empresa</option>
                </Select>
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Condições de Pagamento</FormLabel>
                <Input name="condicoes_pagamento" defaultValue={selectedCliente?.condicoes_pagamento} />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Limite de Crédito</FormLabel>
                <Input name="limite_credito" type="number" step="0.01" defaultValue={selectedCliente?.limite_credito} />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Notas</FormLabel>
                <Textarea name="notas" defaultValue={selectedCliente?.notas} />
              </FormControl>
            </ModalBody>
            <ModalFooter>
            { loading ? (
             <Button colorScheme="blue" mr={3} disabled>
                            Aguarde
                          </Button>
            ): ( <Button colorScheme="blue" mr={3} type="submit">
                Salvar
              </Button>)}
             
              
              <Button onClick={onClose}>Cancelar</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default GestaoClientes;



