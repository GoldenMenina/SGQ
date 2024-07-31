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
  useDisclosure,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import supabase from '../lib/supabaseClient';

const GestaoVendas = () => {
  const [vendas, setVendas] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedVenda, setSelectedVenda] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const itemsPerPage = 10;

  useEffect(() => {
    fetchVendas();
  }, [currentPage]);

  const fetchVendas = async () => {
    try {
      const { data, error, count } = await supabase
        .from('vendas')
        .select('*', { count: 'exact' })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      if (error) throw error;

      setVendas(data);
      setTotalPages(Math.ceil(count / itemsPerPage));
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      toast({
        title: 'Erro ao buscar vendas',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleNovaVenda = () => {
    setSelectedVenda(null);
    onOpen();
  };

  const handleEditVenda = (venda) => {
    setSelectedVenda(venda);
    onOpen();
  };

  const handleDeleteVenda = async (id) => {
    try {
      const { error } = await supabase.from('vendas').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: 'Venda excluída com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchVendas();
    } catch (error) {
      toast({
        title: 'Erro ao excluir venda',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const vendaData = Object.fromEntries(formData.entries());

    try {
      if (selectedVenda) {
        const { error } = await supabase
          .from('vendas')
          .update(vendaData)
          .eq('id', selectedVenda.id);
        if (error) throw error;

        toast({
          title: 'Venda atualizada com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        const { error } = await supabase.from('vendas').insert(vendaData);
        if (error) throw error;

        toast({
          title: 'Venda adicionada com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      onClose();
      fetchVendas();
    } catch (error) {
      console.error(error);
      toast({
        title: `Erro ao ${selectedVenda ? 'atualizar' : 'adicionar'} venda`,
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
          Gestão de Vendas
        </Heading>
        <Button leftIcon={<FiPlus />} colorScheme="teal" onClick={handleNovaVenda}>
          Nova Venda
        </Button>
      </Box>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>Cliente</Th>
            <Th>Data</Th>
            <Th>Valor</Th>
            <Th>Status</Th>
            <Th>Ações</Th>
          </Tr>
        </Thead>
        <Tbody>
          {vendas.map((venda) => (
            <Tr key={venda.id}>
              <Td>{venda.id}</Td>
              <Td>{venda.cliente}</Td>
              <Td>{new Date(venda.data).toLocaleDateString()}</Td>
              <Td>{venda.valor}</Td>
              <Td>{venda.status}</Td>
              <Td>
                <IconButton
                  icon={<FiEdit />}
                  aria-label="Editar"
                  mr={2}
                  onClick={() => handleEditVenda(venda)}
                />
                <IconButton
                  icon={<FiTrash2 />}
                  aria-label="Excluir"
                  onClick={() => handleDeleteVenda(venda.id)}
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
          <ModalHeader>{selectedVenda ? 'Editar Venda' : 'Nova Venda'}</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <FormControl>
                <FormLabel>Cliente</FormLabel>
                <Input name="cliente" defaultValue={selectedVenda?.cliente} required />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Data</FormLabel>
                <Input name="data" type="date" defaultValue={selectedVenda?.data} required />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Valor</FormLabel>
                <Input name="valor" type="number" step="0.01" defaultValue={selectedVenda?.valor} required />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Status</FormLabel>
                <Select name="status" defaultValue={selectedVenda?.status} required>
                  <option value="pendente">Pendente</option>
                  <option value="concluída">Concluída</option>
                </Select>
              </FormControl>
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

export default GestaoVendas;