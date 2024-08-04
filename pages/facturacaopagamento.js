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
  IconButton,
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
  const [itens, setItens] = useState([{ produto_id: '', quantidade: '', preco: '' }]);
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
      const { data, error } = await supabase.from('serviços').select('*').order('titulo');
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

  const fetchFacturaItens = async (facturaId) => {
    try {
      const { data, error } = await supabase
        .from('factura_itens')
        .select('*')
        .eq('factura_id', facturaId);
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar itens da factura:', error);
      toast({
        title: 'Erro ao buscar itens da factura',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleNovoFactura = () => {
    setSelectedFactura(null);
    setItens([{ produto_id: '', quantidade: '', preco: '' }]);
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
    const total = itens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);

    try {
      let facturaId;
      if (selectedFactura) {
        const { data, error } = await supabase
          .from('facturas')
          .update({ ...facturaData, total })
          .eq('id', selectedFactura.id);
        if (error) throw error;
        facturaId = data[0].id;
      } else {
        const { data, error } = await supabase.from('facturas').insert({ ...facturaData, total });
        if (error) throw error;
        facturaId = data[0].id;
      }

      // Handle items
      await Promise.all(
        itens.map(async (item) => {
          const { id, ...itemData } = item;
          if (id) {
            await supabase.from('factura_itens').update(itemData).eq('id', id);
          } else {
            await supabase.from('factura_itens').insert({ ...itemData, factura_id: facturaId });
          }
        })
      );

      toast({
        title: `Factura ${selectedFactura ? 'atualizada' : 'adicionada'} com sucesso`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

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

  const handleItemChange = (index, field, value) => {
    const newItems = [...itens];
    newItems[index][field] = value;

    // Update price based on selected product or service
    if (field === 'produto_id' || field === 'servico_id') {
      const selectedProduct = produtos.find(p => p.id === value);
      const selectedService = servicos.find(s => s.id === value);
      newItems[index].preco = selectedProduct ? selectedProduct.preco_venda : selectedService ? selectedService.preco : '';
    }

    setItens(newItems);
  };

  const addItem = () => {
    setItens([...itens, { produto_id: '', quantidade: '', preco: '' }]);
  };

  const generatePDF = async (factura) => {
    const doc = new jsPDF();
    const itens = await fetchFacturaItens(factura.id);

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
        <Heading as="h1" size="xl">Facturação e Pagamentos</Heading>
        <Button onClick={handleNovoFactura} colorScheme="blue" leftIcon={<FiPlus />}>
          Nova Factura
        </Button>
      </Box>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>Cliente</Th>
            <Th>Data</Th>
            <Th>Total</Th>
            <Th>Ações</Th>
          </Tr>
        </Thead>
        <Tbody>
          {facturas.map((factura) => (
            <Tr key={factura.id}>
              <Td>{factura.id}</Td>
              <Td>{clientes.find((c) => c.id === factura.cliente_id)?.nome || 'N/A'}</Td>
              <Td>{new Date(factura.data).toLocaleDateString()}</Td>
              <Td>{factura.total}</Td>
              <Td>
                <IconButton
                  icon={<FiEdit />}
                  onClick={() => handleEditFactura(factura)}
                  mr={2}
                />
                <IconButton
                  icon={<FiTrash2 />}
                  onClick={() => handleDeleteFactura(factura.id)}
                  mr={2}
                />
                <IconButton
                  icon={<FiPrinter />}
                  onClick={() => generatePDF(factura)}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedFactura ? 'Editar Factura' : 'Nova Factura'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form id="factura-form" onSubmit={handleSubmit}>
              <FormControl id="cliente_id" isRequired mb={3}>
                <FormLabel>Cliente</FormLabel>
                <Select name="cliente_id" defaultValue={selectedFactura?.cliente_id || ''}>
                  <option value="">Selecione um cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </option>
                  ))}
                </Select>
              </FormControl>
              {itens.map((item, index) => (
                <Box key={index} mb={3} p={3} borderWidth="1px" borderRadius="md">
                  <FormControl id={`produto_id_${index}`} mb={3}>
                    <FormLabel>Produto ou Serviço</FormLabel>
                    <Select
                      name={`produto_id_${index}`}
                      value={item.produto_id}
                      onChange={(e) => handleItemChange(index, 'produto_id', e.target.value)}
                    >
                      <option value="">Selecione um produto ou serviço</option>
                      {produtos.map((produto) => (
                        <option key={produto.id} value={produto.id}>
                          {produto.nome}
                        </option>
                      ))}
                      {servicos.map((servico) => (
                        <option key={servico.id} value={servico.id}>
                          {servico.titulo}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl id={`quantidade_${index}`} mb={3}>
                    <FormLabel>Quantidade</FormLabel>
                    <Input
                      name={`quantidade_${index}`}
                      type="number"
                      value={item.quantidade}
                      onChange={(e) => handleItemChange(index, 'quantidade', e.target.value)}
                    />
                  </FormControl>
                  <FormControl id={`preco_${index}`} mb={3}>
                    <FormLabel>Preço</FormLabel>
                    <Input
                      name={`preco_${index}`}
                      type="number"
                      value={item.preco}
                      readOnly
                    />
                  </FormControl>
                </Box>
              ))}
              <Button onClick={addItem} colorScheme="blue" leftIcon={<FiPlus />} mb={3}>
                Adicionar Item
              </Button>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose} mr={3}>Cancelar</Button>
            <Button form="factura-form" type="submit" colorScheme="blue">
              {selectedFactura ? 'Atualizar Factura' : 'Criar Factura'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Facturacao;