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
  useToast,
} from '@chakra-ui/react';
import { FiPlus, FiEdit, FiTrash2, FiPrinter } from 'react-icons/fi';
import jsPDF from 'jspdf';
import supabase from '../lib/supabaseClient';

const Facturacao = () => {
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
      const { data, error } = await supabase.from('facturas').select('*').order('data', { ascending: false });
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
      const { data, error } = await supabase.from('clientes').select('*').order('nome');
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
      const { data, error } = await supabase.from('produtos').select('*').order('nome');
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
      const { data, error } = await supabase.from('servicos').select('*').order('titulo');
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

  const handleNovoFactura = () => {
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

  const generatePDF = (factura) => {
    const doc = new jsPDF();

    // Add title
    doc.text("Proforma Invoice", 20, 20);

    // Add client info
    const cliente = clientes.find((c) => c.id === factura.cliente_id);
    if (cliente) {
      doc.text(`Client Name: ${cliente.nome}`, 20, 30);
      doc.text(`Client Email: ${cliente.email}`, 20, 40);
      doc.text(`Client Phone: ${cliente.telefone}`, 20, 50);
    }

    // Add invoice items
    const itens = factura.itens || [];
    let yOffset = 60;
    itens.forEach((item, index) => {
      const produto = produtos.find((p) => p.id === item.produto_id);
      const servico = servicos.find((s) => s.id === item.servico_id);
      doc.text(`Item ${index + 1}: ${produto ? produto.nome : servico ? servico.titulo : 'N/A'}`, 20, yOffset);
      doc.text(`Quantidade: ${item.quantidade}`, 20, yOffset + 10);
      doc.text(`Preço: ${item.preco}`, 20, yOffset + 20);
      yOffset += 30;
    });

    // Add total
    doc.text(`Total: ${factura.total}`, 20, yOffset);

    // Save the PDF
    doc.save(`proforma_invoice_${factura.id}.pdf`);
  };

  return (
    <Container maxW="container.xl">
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={5}>
        <Heading as="h1" size="xl">
          Facturação
        </Heading>
        <Button leftIcon={<FiPlus />} colorScheme="teal" onClick={handleNovoFactura}>
          Novo Proforma
        </Button>
      </Box>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Cliente</Th>
            <Th>Status</Th>
            <Th>Total</Th>
            <Th>Data</Th>
            <Th>Ações</Th>
          </Tr>
        </Thead>
        <Tbody>
          {facturas.map((factura) => (
            <Tr key={factura.id}>
              <Td>{clientes.find((c) => c.id === factura.cliente_id)?.nome}</Td>
              <Td>{factura.status}</Td>
              <Td>R$ {factura.total}</Td>
              <Td>{new Date(factura.data).toLocaleDateString()}</Td>
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
                  mr={2}
                  onClick={() => handleDeleteFactura(factura.id)}
                />
                <IconButton
                  icon={<FiPrinter />}
                  aria-label="Imprimir"
                  onClick={() => generatePDF(factura)}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} >
      <ModalContent>
          <ModalHeader>{selectedFactura ? 'Editar Proforma' : 'Novo Proforma'}</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <FormControl>
                <FormLabel>Cliente</FormLabel>
                <Select name="cliente_id" defaultValue={selectedFactura?.cliente_id} required>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Status</FormLabel>
                <Select name="status" defaultValue={selectedFactura?.status} required>
                  <option value="proforma">Proforma</option>
                  <option value="invoice">Invoice</option>
                  <option value="paid">Paid</option>
                </Select>
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Total</FormLabel>
                <Input name="total" type="number" step="0.01" defaultValue={selectedFactura?.total} required />
              </FormControl>
              {/* Add more form controls as needed for the items */}
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

export default Facturacao;