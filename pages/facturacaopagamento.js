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
import Invoice from 'react-invoice';

const FacturacaoPagamentos = () => {
  const [invoices, setInvoices] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchInvoices();
    fetchClientes();
    fetchProdutos();
    fetchServicos();
  }, []);

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('criado_em', { ascending: false });

      if (error) throw error;
      setInvoices(data);
    } catch (error) {
      console.error('Erro ao buscar invoices:', error);
      toast({
        title: 'Erro ao buscar invoices',
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
        .select('*')
        .order('nome');

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
        .select('*')
        .order('nome');

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
        .from('servicos')
        .select('*')
        .order('titulo');

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

  const handleNewInvoice = () => {
    setSelectedInvoice(null);
    onOpen();
  };

  const handleEditInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    onOpen();
  };

  const handleDeleteInvoice = async (id) => {
    try {
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: 'Invoice excluído com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchInvoices();
    } catch (error) {
      toast({
        title: 'Erro ao excluir invoice',
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
    const invoiceData = Object.fromEntries(formData.entries());

    try {
      if (selectedInvoice) {
        const { error } = await supabase
          .from('invoices')
          .update(invoiceData)
          .eq('id', selectedInvoice.id);
        if (error) throw error;

        toast({
          title: 'Invoice atualizado com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        const { error } = await supabase.from('invoices').insert(invoiceData);
        if (error) throw error;

        toast({
          title: 'Invoice adicionado com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      onClose();
      fetchInvoices();
    } catch (error) {
      console.error(error);
      toast({
        title: `Erro ao ${selectedInvoice ? 'atualizar' : 'adicionar'} invoice`,
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
        <Button leftIcon={<FiPlus />} colorScheme="teal" onClick={handleNewInvoice}>
          Novo Invoice
        </Button>
      </Box>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Cliente</Th>
            <Th>Tipo</Th>
            <Th>Status</Th>
            <Th>Criado em</Th>
            <Th>Ações</Th>
          </Tr>
        </Thead>
        <Tbody>
          {invoices.map((invoice) => (
            <Tr key={invoice.id}>
              <Td>{invoice.cliente_id}</Td>
              <Td>{invoice.tipo}</Td>
              <Td>{invoice.status}</Td>
              <Td>{new Date(invoice.criado_em).toLocaleDateString()}</Td>
              <Td>
                <IconButton
                  icon={<FiEdit />}
                  aria-label="Editar"
                  mr={2}
                  onClick={() => handleEditInvoice(invoice)}
                />
                <IconButton
                  icon={<FiTrash2 />}
                  aria-label="Excluir"
                  onClick={() => handleDeleteInvoice(invoice.id)}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedInvoice ? 'Editar Invoice' : 'Novo Invoice'}</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <FormControl>
                <FormLabel>Cliente</FormLabel><Select name="cliente_id" defaultValue={selectedInvoice?.cliente_id} required>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Funcionário</FormLabel>
                <Select name="funcionario_id" defaultValue={selectedInvoice?.funcionario_id} required>
                  {/* Assuming you have a list of funcionarios in your state */}
                  {usuarios.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nome}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Tipo</FormLabel>
                <Select name="tipo" defaultValue={selectedInvoice?.tipo || 'proforma'} required>
                  <option value="proforma">Proforma</option>
                  <option value="invoice">Invoice</option>
                </Select>
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Status</FormLabel>
                <Select name="status" defaultValue={selectedInvoice?.status || 'open'} required>
                  <option value="open">Open</option>
                  <option value="paid">Paid</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Itens</FormLabel>
                {/* Render input fields for adding produtos/servicos to the invoice */}
                {/* You can use a dynamic form component or a library like Formik for this */}
                {selectedInvoice?.items.map((item, index) => (
                  <Box key={index}>
                    <Select name={`items[${index}].item_type`} defaultValue={item.item_type} required>
                      <option value="produto">Produto</option>
                      <option value="serviço">Serviço</option>
                    </Select>
                    <Select name={`items[${index}].item_id`} defaultValue={item.item_id} required>
                      {item.item_type === 'produto'
                        ? produtos.map((produto) => (
                            <option key={produto.id} value={produto.id}>
                              {produto.nome}
                            </option>
                          ))
                        : servicos.map((servico) => (
                            <option key={servico.id} value={servico.id}>
                              {servico.titulo}
                            </option>
                          ))}
                    </Select>
                    <NumberInput min={0} defaultValue={item.quantidade}>
                      <NumberInputField name={`items[${index}].quantidade`} required />
                    </NumberInput>
                    <NumberInput min={0} precision={2} defaultValue={item.preco_unitario}>
                      <NumberInputField name={`items[${index}].preco_unitario`} required />
                    </NumberInput>
                    <Input type="hidden" name={`items[${index}].total`} value={item.total} />
                  </Box>
                ))}
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

export default FacturacaoPagamentos;