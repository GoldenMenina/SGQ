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
  NumberInput,
  NumberInputField,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import supabase from '../lib/supabaseClient';
import InvoiceGenerator from 'react-invoice-generator';

const GestaoFacturacao = () => {
  const [facturas, setFacturas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [selectedFactura, setSelectedFactura] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchFacturas();
    fetchClientes();
    fetchProdutos();
    fetchServicos();
  }, []);

  const fetchFacturas = async () => {
    try {
      const { data, error } = await supabase
        .from('facturas')
        .select('*');

      if (error) throw error;
      setFacturas(data);
    } catch (error) {
      console.error('Erro ao buscar facturas:', error);
      toast({
        title: 'Erro ao buscar facturas',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*');

      if (error) throw error;
      setClientes(data);
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

  const fetchProdutos = async () => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*');

      if (error) throw error;
      setProdutos(data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      toast({
        title: 'Erro ao buscar produtos',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchServicos = async () => {
    try {
      const { data, error } = await supabase
        .from('serviços')
        .select('*');

      if (error) throw error;
      setServicos(data);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      toast({
        title: 'Erro ao buscar serviços',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleNovaFactura = () => {
    setSelectedFactura(null);
    onOpen();
  };

  const handleEditFactura = (factura) => {
    setSelectedFactura(factura);
    onOpen();
  };

  const handleDeleteFactura = async (id) => {
    try {
      const { error } = await supabase.from('facturas').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: 'Factura excluída com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchFacturas();
    } catch (error) {
      toast({
        title: 'Erro ao excluir factura',
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
    const facturaData = Object.fromEntries(formData.entries());

    try {
      if (selectedFactura) {
        const { error } = await supabase
          .from('facturas')
          .update(facturaData)
          .eq('id', selectedFactura.id);
        if (error) throw error;

        toast({
          title: 'Factura atualizada com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        const { error } = await supabase.from('facturas').insert(facturaData);
        if (error) throw error;

        toast({
          title: 'Factura adicionada com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      onClose();
      fetchFacturas();
    } catch (error) {
      console.error(error);
      toast({
        title: `Erro ao ${selectedFactura ? 'atualizar' : 'adicionar'} factura`,
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
          Facturação e Pagamentos
        </Heading>
        <Button leftIcon={<FiPlus />} colorScheme="teal" onClick={handleNovaFactura}>
          Nova Factura
        </Button>
      </Box>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Cliente</Th>
            <Th>Tipo</Th>
            <Th>Estado</Th>
            <Th>Criado Em</Th>
            <Th>Ações</Th>
          </Tr>
        </Thead>
        <Tbody>
          {facturas.map((factura) => (
            <Tr key={factura.id}>
              <Td>{clientes.find(cliente => cliente.id === factura.cliente_id)?.nome}</Td>
              <Td>{factura.tipo}</Td>
              <Td>{factura.estado}</Td>
              <Td>{new Date(factura.criado_em).toLocaleDateString()}</Td>
              <Td>
                <IconButton
                  icon={<FiEdit />}
                  aria-label="Editar"
                  mr={2}
                  onClick={() => handleEditFactura(factura)}
                />
                <IconButton
                  icon={<FiTrash2 />}
                  aria-label="Excluir"
                  onClick={() => handleDeleteFactura(factura.id)}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedFactura ? 'Editar Factura' : 'Nova Factura'}</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <FormControl>
                <FormLabel>Cliente</FormLabel>
                <Select name="cliente_id" defaultValue={selectedFactura?.cliente_id} required>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Tipo</FormLabel>
                <Select name="tipo" defaultValue={selectedFactura?.tipo} required>
                  <option value="proforma">Proforma</option>
                  <option value="invoice">Invoice</option>
                </Select>
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Produtos/Serviços</FormLabel>
                {/* Add a component for managing items */}
                <InvoiceGenerator
                  produtos={produtos}
                  servicos={servicos}
                  selectedItems={selectedFactura?.items || []}
                />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Funcionário</FormLabel>
                <Select name="funcionario_id" defaultValue={selectedFactura?.funcionario_id} required>
                  {/* Populate this with the list of users */}
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

export default GestaoFacturacao;