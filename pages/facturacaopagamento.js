import { useState, useEffect, useRef } from 'react';
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
  Stack,
  InputGroup,
  InputLeftElement,
  useDisclosure,
  useToast,
  IconButton,
  List,
  ListItem,
} from '@chakra-ui/react';
import { FiPlus, FiEdit, FiSearch, FiTrash2, FiPrinter, FiCalendar } from 'react-icons/fi';
import jsPDF from 'jspdf';
import supabase from '../lib/supabaseClient';
import { getSession } from '../lib/session';
import axios from 'axios'

const Facturacao = () => {
  const [searchValue, setSearchValue] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const searchRef = useRef(null);
  const [facturas, setFacturas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [empresa, setEmpresa] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFactura, setSelectedFactura] = useState(null);
  const [itens, setItens] = useState([{ produto_id: '', quantidade: 1, preco: 0 }]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [user, setUser] = useState(null);

  
  const handleItemChange = (index, field, value, item = null) => {
    const newItens = [...itens];
    newItens[index][field] = value;

    if (field === 'produto_id' && item) {
      newItens[index].preco = item.preco_venda || item.preco || 0;
      newItens[index].nome = item.nome || item.titulo || '';
      newItens[index].tipo = item.preco_venda ? 'produto' : 'servico';
    }

    setItens(newItens);
    setSearchValue('');
    setFilteredItems([]);
  };

  const handleSearchProductChange = (index, value) => {
    setSearchValue(value);
    const filtered = [...produtos, ...servicos].filter(item => 
      item.nome?.toLowerCase().includes(value.toLowerCase()) || 
      item.titulo?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredItems(filtered);
  };

  const handleSearchSelect = (index, item) => {
    handleItemChange(index, 'produto_id', item._id, item);
  };




  useEffect(() => {
    const userSession = getSession();
    if (userSession) {
      setUser(userSession);
    }
  }, []);
  
  const [currentPage, setCurrentPage] = useState(1);
  
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const toast = useToast();
  var newItems = []

  useEffect(() => {
    fetchAll();
  }, []);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  useEffect(() => {
    fetchFacturas();
  }, [currentPage, searchTerm, startDate, endDate]);
  
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
          const response = await axios.get(`/api/facturacao?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}&startDate=${startDate}&endDate=${endDate}`);
      setFacturas(response.data.facturas);
      setTotalPages(Math.ceil(response.data.total / itemsPerPage));
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


  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };
const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
    setCurrentPage(1);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
    setCurrentPage(1);
  };

  const handleNovoFactura = () => {
    setSelectedFactura(null);
    setItens([{ produto_id: '', quantidade: 1, preco: 0}]);
    onOpen();
  };

  const handleEditFactura = async (factura) => {
    setSelectedFactura(factura)
    const facturaItens = factura.itens
    setItens(facturaItens.map(item => ({
      produto_id: item.produto_id || item.servico_id,
      quantidade: item.quantidade,
      preco: item.preco,
    })));
    onOpen();
  };

  const handleDeleteFactura = async (id) => {
    try {
       await axios.delete(`/api/facturacao/${id}`);
     
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



  const addItem = () => {
    setItens([...itens, { produto_id: '', quantidade: 1, nome:'',preco: 0 }]);
    
  
  };

  const calculateTotal = () => {
    return itens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  };

  const handleSubmit = async (event) => {
  event.preventDefault();
  setLoading(true)
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
  
  try {
    let facturaId;
    if (selectedFactura) {
      await axios.put(`/api/facturacao/${selectedFactura._id}`, facturaData);
    } else {
      
  const cliente = clientes.find((c) => c._id === facturaData.cliente_id);
      var facturaInfo = facturaData
      facturaInfo.itens = itens
      facturaInfo.nome = cliente.nome
      await axios.post('/api/facturacao', facturaInfo);
    }


    toast({
      title: `Factura ${selectedFactura ? 'atualizada' : 'adicionada'} com sucesso`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });

    onClose();
    fetchFacturas();
    setLoading(false)
  } catch (error) {
    console.error('Error in handleSubmit:', error);
    toast({
      title: `Erro ao ${selectedFactura ? 'atualizar' : 'adicionar'} factura`,
      description: error.message,
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
    setLoading(false)
  }
};

const generatePDF = async (factura) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const itens = factura.itens;
  const cliente = clientes.find((c) => c._id === factura.cliente_id);

  // Set colors
  const primaryColor = '#3498db';
  const secondaryColor = '#2c3e50';

  // Add logo
  doc.addImage(empresa.foto_url || 'https://picsum.photos/200/100', 'JPEG', 10, 0, 50, 50);

  // Add title
  doc.setFontSize(24);
  doc.setTextColor(primaryColor);
  doc.text(`${factura.status == 'proforma' ? 'FACTURA PROFORMA' : (factura.status == 'paid' ? 'FACTURA PAGO' : 'FACTURA')}`, 200, 20, { align: 'right' });

  // Add invoice details
  doc.setFontSize(10);
  doc.setTextColor(secondaryColor);
  doc.text(`Factura Nº: FAT-${factura._id.toString().padStart(4, '0')}`, 200, 30, { align: 'right' });
  doc.text(`Data: ${new Date().toLocaleDateString('pt-PT')}`, 200, 35, { align: 'right' });
  doc.text(`Data de Vencimento: ${new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString('pt-PT')}`, 200, 40, { align: 'right' });

  // Add company info with adjusted spacing
  doc.setFontSize(12);
  doc.text(empresa.nome, 10, 50);
  doc.setFontSize(10);
  doc.text(empresa.endereco, 10, 56);
  doc.text(empresa.telefone, 10, 62);
  doc.text(empresa.email, 10, 68);

  // Add client info with adjusted spacing
  if (cliente) {
    doc.setFontSize(12);
    doc.text("Factura para:", 10, 80);
    doc.setFontSize(10);
    doc.text(cliente.nome, 10, 86);
    doc.text(cliente.email, 10, 92);
    doc.text(cliente.telefone, 10, 98);
  }

  // Add table header
  let yOffset = 110;
  doc.setFillColor(primaryColor);
  doc.rect(10, yOffset, 190, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text("Item", 12, yOffset + 7);
  doc.text("Qtd", 60, yOffset + 7);
  doc.text("Preço Unit.", 80, yOffset + 7);
  doc.text("Desconto", 110, yOffset + 7);
  doc.text("Taxa Imposto", 140, yOffset + 7);
  doc.text("Total", 175, yOffset + 7);

  // Add invoice items
  yOffset += 15;
  doc.setTextColor(secondaryColor);
  let subtotal = 0;
  itens.forEach((item, index) => {
    const itemTotal = item.quantidade * parseFloat(item.preco);
    subtotal += itemTotal;

    doc.text(item.nome, 12, yOffset, { maxWidth: 45 });
    doc.text(item.quantidade.toString(), 62, yOffset);
    doc.text(`${parseFloat(item.preco).toFixed(2)} Kz`, 82, yOffset);
    doc.text(`0%`, 115, yOffset); // Assuming no discount for now
    doc.text(`14%`, 150, yOffset);
    doc.text(`${itemTotal.toFixed(2)} Kz`, 177, yOffset);

    yOffset += 10;
  });

  // Calculate tax and total
  const tax = subtotal * 0.14;
  const total = subtotal + tax;

  // Add subtotal
  yOffset += 10;
  doc.setFillColor(primaryColor);
  doc.rect(130, yOffset, 70, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text("Subtotal:", 135, yOffset + 7);
  doc.text(`${subtotal.toFixed(2)} Kz`, 175, yOffset + 7);

  // Add tax
  yOffset += 15;
  doc.setTextColor(secondaryColor);
  doc.text("Imposto (14%):", 135, yOffset);
  doc.text(`${tax.toFixed(2)} Kz`, 175, yOffset);

  // Add total
  yOffset += 10;
  doc.setFillColor(primaryColor);
  doc.rect(130, yOffset, 70, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text("Total:", 135, yOffset + 7);
  doc.text(`${total.toFixed(2)} Kz`, 175, yOffset + 7);

  // Add payment information
  yOffset += 20;
  doc.setTextColor(secondaryColor);
  doc.setFontSize(12);
  doc.text("Formas de Pagamento", 10, yOffset);
  doc.setFontSize(10);
  yOffset += 7;
  doc.text("Transferência Bancária:", 10, yOffset);
  yOffset += 5;
  doc.text("Banco " + empresa.banco_nome, 15, yOffset);
  yOffset += 5;
  doc.text(empresa.banco_iban, 15, yOffset);
  yOffset += 5;
  doc.text("BIC/SWIFT: " + empresa.banco_bic, 15, yOffset);

  // Add footer
  doc.setTextColor(secondaryColor);
  doc.setFontSize(8);
  doc.text("Obrigado pela sua preferência!", 105, 280, { align: 'center' });

  // Save the PDF
  doc.save(`Factura_${factura.status}_${factura._id}.pdf`);
};
  return (
    <Container maxW="container.xl" py={4}>
      <Heading as="h1" mb={4}>Facturação e Pagamentos</Heading>
      <Button leftIcon={<FiPlus />} colorScheme="teal" onClick={handleNovoFactura}>
        Nova Factura
      </Button>
      
      <Box mt={4}>
      
<Stack direction={["column", "row"]} spacing={4} mb={5}>
              <InputGroup>
                <InputLeftElement pointerEvents="none" children={<FiSearch color="gray.300" />} />
                <Input
                  type="text"
                  placeholder="Buscar por nome"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </InputGroup><InputGroup>
          <InputLeftElement pointerEvents="none" children={<FiCalendar color="gray.300" />} />
          <Input
            type="date"
            placeholder="Data inicial"
            value={startDate}
            onChange={handleStartDateChange}
          />
        </InputGroup>
        <InputGroup>
          <InputLeftElement pointerEvents="none" children={<FiCalendar color="gray.300" />} />
          <Input
            type="date"
            placeholder="Data final"
            value={endDate}
            onChange={handleEndDateChange}
          />
        </InputGroup>
        </Stack>
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
              <Tr key={factura._id}>
                <Td>{factura._id}</Td>
                <Td>{factura.nome}</Td>
                <Td>{new Date(factura.data).toLocaleDateString()}</Td>
                <Td>{factura.total}</Td>
                <Td>
                {user && user.nivel_acesso === 'admin'&&(<>
                  <IconButton
                    icon={<FiEdit />}
                    onClick={() => handleEditFactura(factura)}
                    mr={2}
                  />
                  <IconButton
                    icon={<FiTrash2 />}
                    colorScheme="red"
                    onClick={() => handleDeleteFactura(factura._id)}
                    mr={2}
                  /></>)}
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
                <Select name="cliente_id" defaultValue={selectedFactura?.cliente_id || ''} required ><option value="" disabled>Selecione um cliente</option>
                  {clientes.map(cliente => (
                    <option onClick={()=>{console.log(cliente)}} key={cliente._id} value={cliente._id}>
                      {cliente.nome}
                    </option>
                  ))}
                </Select>
              </FormControl><FormControl id="status" mb={4} isRequired>
                <FormLabel>Status</FormLabel>
                <Select name="status" defaultValue={selectedFactura?.status || ''}>
                  <option value="proforma">Proforma</option>
                  <option value="invoice">Factura</option>
                  <option value="paid">Pago</option>
                </Select>
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Data de entrega</FormLabel>
                <Input type="date" name="data" defaultValue={selectedFactura?.data.split('T')[0] || ''} required />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Itens</FormLabel>
                {itens.map((item, index) => (
  <Box key={index} mb={4} borderWidth={1} borderRadius="md" p={4}>
  <FormControl mb={2}>
    <FormLabel>Produto ou Serviço</FormLabel>
    <InputGroup>
      <Input
        value={searchValue}
        onChange={(e) => handleSearchProductChange(index, e.target.value)}
        placeholder="Buscar produto ou serviço"
        ref={searchRef}
      />
    </InputGroup>
    {filteredItems.length > 0 && (
      <List
        position="absolute"
        zIndex={1}
        bg="white"
        borderWidth={1}
        borderRadius="md"
        width="100%"
        maxHeight="200px"
        overflowY="auto"
      >
        {filteredItems.map((filteredItem) => (
          <ListItem
            key={filteredItem._id}
            p={2}
            cursor="pointer"
            _hover={{ bg: "gray.100" }}
            onClick={() => handleSearchSelect(index, filteredItem)}
          >
            {filteredItem.nome || filteredItem.titulo} ({filteredItem.preco_venda ? 'Produto' : 'Serviço'})
          </ListItem>
        ))}
      </List>
    )}
  </FormControl>
  <FormControl mb={2}>
  <Input
        value={item.nome}
        readOnly
      />
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
</Box>
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
              {loading? ( <Button colorScheme="teal">
                Aguarde..
              </Button>):( <Button colorScheme="teal" type="submit">
                {selectedFactura ? 'Atualizar' : 'Efectuar'}
              </Button>)}
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Facturacao;