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
  IconButton
} from '@chakra-ui/react';
import { FiPlus, FiEdit, FiTrash2, FiPrinter } from 'react-icons/fi';
import jsPDF from 'jspdf';
import supabase from '../lib/supabaseClient';

import axios from 'axios'

const Facturacao = () => {
  const [facturas, setFacturas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [empresa, setEmpresa] = useState([]);
  const [selectedFactura, setSelectedFactura] = useState(null);
  const [itens, setItens] = useState([{ produto_id: '', quantidade: 1, preco: 0 }]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchAll();
  }, []);
  
  const fetchAll = async () => {
    try {
      const response = await axios.get(`/api/facturacao/all`);
      setClientes(response.data.clientes)
      setProdutos(response.data.produtos)
      setServicos(response.data.servicos)
      setEmpresa(response.data.empresa)
    } catch (error) {
      console.error('Erro ao buscar informações:', error);
      toast({
        title: 'Erro ao buscar informações',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };


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


  const fetchFacturaItens = async (facturaId) => {
    try {
      const { data, error } = await supabase.from('factura_itens').select('*').eq('factura_id', facturaId);
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
    setItens([{ produto_id: '', quantidade: 1, preco: 0}]);
    onOpen();
  };

  const handleEditFactura = async (factura) => {
    const facturaItens = await fetchFacturaItens(factura.id);
    setSelectedFactura(factura);
    setItens(facturaItens.map(item => ({
      produto_id: item.produto_id || item.servico_id,
      quantidade: item.quantidade,
      preco: item.preco,
    })));
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

  const handleItemChange = (index, field, value) => {
    const newItens = [...itens];
    newItens[index][field] = value;

    // Update price if product or service is selected
    if (field === 'produto_id' && value) {
      const selectedProduto = produtos.find(prod => prod.id === value);
      const selectedServico = servicos.find(serv => serv.id === value);
      newItens[index].preco = selectedProduto?.preco_venda || selectedServico?.preco || 0;
    }

    setItens(newItens);
  };

  const addItem = () => {
    setItens([...itens, { produto_id: '', quantidade: 1, preco: 0 }]);
  };

  const calculateTotal = () => {
    return itens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  };

  const handleSubmit = async (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const facturaData = Object.fromEntries(formData.entries());
facturaData.total = calculateTotal();
  // Ensure total is non-negative and calculate total if necessary
  if (isNaN(facturaData.total) || parseFloat(facturaData.total) < 0) {
    return toast({
      title: 'Total inválido',
      description: 'O total deve ser um valor não negativo.',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  }
console.log(facturaData)
return false 
  
  try {
    let facturaId;
    if (selectedFactura) {
      // Update existing factura
      const { data, error } = await supabase
        .from('facturas')
        .update(facturaData)
        .eq('id', selectedFactura.id)
        .select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Factura was updated but no data was returned');
      }
      facturaId = selectedFactura.id;
    } else {
      // Insert new factura
      const { data, error } = await supabase
        .from('facturas')
        .insert(facturaData)
        .select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Factura was inserted but no data was returned');
      }
      facturaId = data[0].id;
    }

    console.log('Factura ID:', facturaId);
    console.log('Items to insert/update:', itens);

    // Handle factura_itens
    for (const item of itens) {
      const itemData = { ...item, factura_id: facturaId };

      // Ensure quantity and price are valid
      if (itemData.quantidade <= 0) {
        return toast({
          title: 'Quantidade inválida',
          description: 'A quantidade deve ser maior que zero.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
      if (itemData.preco < 0) {
        return toast({
          title: 'Preço inválido',
          description: 'O preço deve ser um valor não negativo.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }

      // Check for existing item with the same factura_id and produto_id/servico_id
      const existingItem = await supabase
        .from('factura_itens')
        .select('*')
        .eq('factura_id', facturaId)
        .eq('produto_id', itemData.produto_id)
        .single();

      if (existingItem) {
        // Update existing item
        const { error } = await supabase
          .from('factura_itens')
          .update(itemData)
          .eq('factura_id', existingItem.factura_id)
          .eq('produto_id', existingItem.produto_id);
        if (error) throw error;
      } else {
        // Insert new item
        const { error } = await supabase
          .from('factura_itens')
          .insert(itemData);
        if (error) throw error;
      }
    }

    toast({
      title: `Factura ${selectedFactura ? 'atualizada' : 'adicionada'} com sucesso`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });

    onClose();
    fetchFacturas();
  } catch (error) {
    console.error('Error in handleSubmit:', error);
    toast({
      title: `Erro ao ${selectedFactura ? 'atualizar' : 'adicionar'} factura`,
      description: error.message,
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
  }
};
const fetchCompanyDetails = async () => {
  try {
    const { data, error } = await supabase.from('empresa').select('*').single();
    if (error) throw error;
    setEmpresa(data)
  } catch (error) {
    console.error('Erro ao buscar informações da empresa:', error);
    return null;
  }
};

  const generatePDF = async (factura) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const itens = await fetchFacturaItens(factura.id);
  const cliente = clientes.find((c) => c.id === factura.cliente_id);

  // Set colors
  const primaryColor = '#3498db';
  const secondaryColor = '#2c3e50';

  // Add logo
  doc.addImage(empresa.foto_url || 'https://picsum.photos/200/100', 'JPEG', 10, 10, 50, 25);

  // Add title
  doc.setFontSize(24);
  doc.setTextColor(primaryColor);
  doc.text("FATURA PROFORMA", 200, 20, { align: 'right' });

  // Add invoice details
  doc.setFontSize(10);
  doc.setTextColor(secondaryColor);
  doc.text(`Fatura Nº: FAT-${factura.id.toString().padStart(4, '0')}`, 200, 30, { align: 'right' });
  doc.text(`Data: ${new Date().toLocaleDateString('pt-PT')}`, 200, 35, { align: 'right' });
  doc.text(`Data de Vencimento: ${new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString('pt-PT')}`, 200, 40, { align: 'right' });

  // Add company info
  doc.setFontSize(12);
  doc.text(empresa.nome, 10, 50);
  doc.setFontSize(10);
  doc.text(empresa.endereco, 10, 55);
  doc.text(empresa.telefone, 10, 60);
  doc.text(empresa.email, 10, 65);

  // Add client info
  if (cliente) {
    doc.setFontSize(12);
    doc.text("Faturar para:", 10, 80);
    doc.setFontSize(10);
    doc.text(cliente.nome, 10, 85);
    doc.text(cliente.email, 10, 90);
    doc.text(cliente.telefone, 10, 95);
  }

  // Add table header
  let yOffset = 110;
  doc.setFillColor(primaryColor);
  doc.rect(10, yOffset, 190, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text("Item", 15, yOffset + 7);
  doc.text("Quantidade", 100, yOffset + 7);
  doc.text("Preço", 130, yOffset + 7);
  doc.text("Total", 170, yOffset + 7);

  // Add invoice items
  yOffset += 15;
  doc.setTextColor(secondaryColor);
  itens.forEach((item, index) => {
    const produto = produtos.find((p) => p.id === item.produto_id);
    const servico = servicos.find((s) => s.id === item.servico_id);
    const itemName = produto ? produto.nome : servico ? servico.titulo : 'N/A';
    const itemTotal = item.quantidade * item.preco;

    doc.text(itemName, 15, yOffset);
    doc.text(item.quantidade.toString(), 105, yOffset);
    doc.text(`${item.preco.toFixed(2)} Kz`, 135, yOffset);
    doc.text(`${itemTotal.toFixed(2)} Kz`, 175, yOffset);

    yOffset += 10;
  });

  // Add total
  yOffset += 10;
  doc.setFillColor(primaryColor);
  doc.rect(130, yOffset, 70, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text("Total:", 135, yOffset + 7);
  doc.text(`${factura.total.toFixed(2)} Kz`, 175, yOffset + 7);

  // Add payment information
  yOffset += 20;
  doc.setTextColor(secondaryColor);
  doc.setFontSize(12);
  doc.text("Formas de Pagamento", 10, yOffset);
  doc.setFontSize(10);
  yOffset += 7;
  doc.text("Transferência Bancária:", 10, yOffset);
  yOffset += 5;
  doc.text("Banco "+empresa.banco_nome, 15, yOffset);
  yOffset += 5;
  doc.text(empresa.banco_iban, 15, yOffset);
  yOffset += 5;
  doc.text("BIC/SWIFT: "+empresa.banco_bic, 15, yOffset);

  // Add footer
  doc.setTextColor(secondaryColor);
  doc.setFontSize(8);
  doc.text("Obrigado pela sua preferência!", 105, 280, { align: 'center' });

  // Save the PDF
  doc.save(`Fatura_Proforma_${factura.id}.pdf`);
};
  return (
    <Container maxW="container.xl" py={4}>
      <Heading as="h1" mb={4}>Facturação e Pagamentos</Heading>
      <Button leftIcon={<FiPlus />} colorScheme="teal" onClick={handleNovoFactura}>
        Nova Factura
      </Button>
      <Box mt={4}>
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
            {facturas.map(factura => (
              <Tr key={factura.id}>
                <Td>{factura.id}</Td>
                <Td>{clientes.find(cliente => cliente.id === factura.cliente_id)?.nome}</Td>
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
                    colorScheme="red"
                    onClick={() => handleDeleteFactura(factura.id)}
                    mr={2}
                  />
                  <IconButton
                    icon={<FiPrinter />}
                    colorScheme="blue"
                    onClick={() => generatePDF(factura)}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedFactura ? 'Editar Factura' : 'Nova Factura'}</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <FormControl mb={4}>
                <FormLabel>Cliente</FormLabel>
                <Select name="cliente_id" defaultValue={selectedFactura?.cliente_id || ''} required>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </option>
                  ))}
                </Select>
              </FormControl><FormControl id="status" mb={4} isRequired>
                <FormLabel>Status</FormLabel>
                <Select name="status" defaultValue={selectedFactura?.status || ''}>
                  <option value="proforma">Proforma</option>
                  <option value="invoice">Invoice</option>
                  <option value="paid">Pago</option>
                </Select>
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Data</FormLabel>
                <Input type="date" name="data" defaultValue={selectedFactura?.data.split('T')[0] || ''} required />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Itens</FormLabel>
                {itens.map((item, index) => (
  <Box key={index} mb={4} borderWidth={1} borderRadius="md" p={4}>
    {
    <>
                    <FormControl mb={2}>
                      <FormLabel>Produto ou Serviço</FormLabel>
                      <Select
                        value={item.produto_id}
                        onChange={(e) => handleItemChange(index, 'produto_id', e.target.value)}
                        required
                      >
                        <option value="" disabled>Selecione um produto ou serviço</option>
                        {produtos.map(produto => (
                          <option key={produto.id} value={produto.id}>
                            {produto.nome} (Produto)
                          </option>
                        ))}
                        {servicos.map(servico => (
                          <option key={servico.id} value={servico.id}>
                            {servico.titulo} (Serviço)
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl mb={2}>
                      <FormLabel>Quantidade</FormLabel>
                      <Input
                        type="number"
                        value={item.quantidade}
                        onChange={(e) => handleItemChange(index, 'quantidade', parseInt(e.target.value))}
                        required
                      />
                    </FormControl>
                    <FormControl mb={2}>
                      <FormLabel>Preço</FormLabel>
                      <Input
                        type="number"
                        value={item.preco}
                        onChange={(e) => handleItemChange(index, 'preco', parseFloat(e.target.value))}
                        readOnly
                      />
                    </FormControl>
                    </>
                  }</Box>
                ))}
                
                <Button leftIcon={<FiPlus />} onClick={addItem}>
                  Adicionar Item
                </Button>
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button onClick={onClose} mr={3}>
                Cancelar
              </Button>
              <Button colorScheme="teal" type="submit">
                {selectedFactura ? 'Atualizar' : 'Adicionar'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Facturacao;