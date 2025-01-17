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
  Textarea,
  Select,
  useDisclosure,
  IconButton,
  InputGroup,
  InputLeftElement,
  useToast,
} from '@chakra-ui/react';
import { FiPlus, FiEdit, FiTrash2,FiSearch } from 'react-icons/fi';
import axios from 'axios';


const GestaoServicos = () => {
  const [servicos, setServicos] = useState([]);
    const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedServico, setSelectedServico] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const itemsPerPage = 10;

  useEffect(() => {
    fetchServicos();
  }, [currentPage,searchTerm]);


const fetchServicos = async () => {
    try {
      const response = await axios.get(`/api/servicos?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}`);
      setServicos(response.data.servicos);
      setTotalPages(Math.ceil(response.data.total / itemsPerPage));
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

  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };


  const handleNovoServico = () => {
    setSelectedServico(null);
    onOpen();
  };

  const handleEditServico = (servico) => {
    setSelectedServico(servico);
    onOpen();
  };

   const handleDeleteServico = async (id) => {
      try {
        await axios.delete(`/api/servicos/${id}`);
        toast({
          title: 'Serviço excluído com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchServicos();
      } catch (error) {
        toast({
          title: 'Erro ao excluir serviço',
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
      const servicoData = Object.fromEntries(formData.entries());
  
      try {
        if (selectedServico) {
          await axios.put(`/api/servicos/${selectedServico._id}`, servicoData);
          toast({
            title: 'Serviço atualizado com sucesso',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        } else {
          await axios.post('/api/servicos', servicoData);
          toast({
            title: 'Serviço adicionado com sucesso',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        }
  
        onClose();
        fetchServicos();
        setLoading(false)
      } catch (error) {
        console.error(error);
        toast({
          title: `Erro ao ${selectedServico ? 'atualizar' : 'adicionar'} serviço`,
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
          Gestão de Serviços
        </Heading>
        <Button leftIcon={<FiPlus />} colorScheme="teal" onClick={handleNovoServico}>
          Novo Serviço
        </Button>
      </Box>

<InputGroup mb={5}>
        <InputLeftElement pointerEvents="none" children={<FiSearch color="gray.300" />} />
        <Input
          type="text"
          placeholder="Buscar por Título, Preço ou Categoria"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </InputGroup>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Título</Th>
            <Th>Descrição</Th>
            <Th>Preço</Th>
            <Th>Categoria</Th>
            <Th>Duração</Th>
            <Th>Ações</Th>
          </Tr>
        </Thead>
        <Tbody>
          {servicos && servicos.map((servico) => (
            <Tr key={servico.id}>
              <Td>{servico.titulo}</Td>
              <Td>{servico.descricao}</Td>
              <Td>{servico.preco}</Td>
              <Td>{servico.categoria}</Td>
              <Td>{servico.duracao}</Td>
              <Td>
                <IconButton
                  icon={<FiEdit />}
                  aria-label="Editar"
                  mr={2}
                  onClick={() => handleEditServico(servico)}
                />
                <IconButton
                  icon={<FiTrash2 />}
                  aria-label="Excluir"
                  onClick={() => handleDeleteServico(servico._id)}
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
          <ModalHeader>{selectedServico ? 'Editar Serviço' : 'Novo Serviço'}</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <FormControl>
                <FormLabel>Título</FormLabel>
                <Input name="titulo" defaultValue={selectedServico?.titulo} required />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Descrição</FormLabel>
                <Textarea name="descricao" defaultValue={selectedServico?.descricao} required />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Preço</FormLabel>
                <Input name="preco" type="number" step="0.01" defaultValue={selectedServico?.preco} required />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Categoria</FormLabel>
                <Input name="categoria" defaultValue={selectedServico?.categoria} />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Duração</FormLabel>
                <Input name="duracao" type="text" defaultValue={selectedServico?.duracao} />
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

export default GestaoServicos;