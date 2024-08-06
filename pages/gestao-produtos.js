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
  NumberInput,
  NumberInputField,
  useDisclosure,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import supabase from '../lib/supabaseClient';
import axios from 'axios';

const GestaoEstoque = () => {
  const [produtos, setProdutos] = useState([]);
  const [selectedProduto, setSelectedProduto] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProdutos();
  }, [currentPage]);

  const fetchProdutos = async () => {
    try {
      const response = await axios.get(`/api/produtos?page=${currentPage}&limit=${itemsPerPage}`);
      setProdutos(response.data.produtos);
      setTotalPages(Math.ceil(response.data.total / itemsPerPage));
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

  const handleNovoProduto = () => {
    setSelectedProduto(null);
    onOpen();
  };

  const handleEditProduto = (produto) => {
    setSelectedProduto({
      ...produto,
      quantidade: Number(produto.quantidade),
      preco_venda: Number(produto.preco_venda),
      preco_custo: Number(produto.preco_custo),
    });
    onOpen();
  };

  const handleDeleteProduto = async (id) => {
    try {
      await axios.delete(`/api/produtos/${id}`);
      toast({
        title: 'Produto excluído com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchProdutos();
    } catch (error) {
      toast({
        title: 'Erro ao excluir produto',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.target);
    const produtoData = Object.fromEntries(formData.entries());

    try {
      if (selectedProduto) {
        await axios.put(`/api/produtos/${selectedProduto._id}`, produtoData);
        toast({
          title: 'Produto atualizado com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await axios.post('/api/produtos', produtoData);
        toast({
          title: 'Produto adicionado com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      onClose();
      fetchProdutos();
    } catch (error) {
      console.error(error);
      toast({
        title: `Erro ao ${selectedProduto ? 'atualizar' : 'adicionar'} produto`,
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Heading>Gestão de Estoque</Heading>
      <Button colorScheme="teal" onClick={handleNovoProduto}>
        Novo Produto
      </Button>

      <Table mt={4}>
        <Thead>
          <Tr>
            <Th>Nome</Th>
            <Th>SKU</Th>
            <Th>Quantidade</Th>
            <Th>Preço de Custo</Th>
            <Th>Preço de Venda</Th>
            <Th>Ações</Th>
          </Tr>
        </Thead>
        <Tbody>
          {produtos.map((produto) => (
            <Tr key={produto._id}>
              <Td>{produto.nome}</Td>
              <Td>{produto.sku}</Td>
              <Td>{produto.quantidade}</Td>
              <Td>AOA {produto.preco_custo}</Td>
              <Td>AOA {produto.preco_venda}</Td>
              <Td>
                <IconButton
                  icon={<FiEdit />}
                  aria-label="Editar"
                  mr={2}
                  onClick={() => handleEditProduto(produto)}
                />
                <IconButton
                  icon={<FiTrash2 />}
                  aria-label="Excluir"
                  onClick={() => handleDeleteProduto(produto._id)}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedProduto ? 'Editar Produto' : 'Novo Produto'}</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <FormControl>
                <FormLabel>Nome</FormLabel>
                <Input name="nome" defaultValue={selectedProduto?.nome || ''} required />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>SKU</FormLabel>
                <Input name="sku" defaultValue={selectedProduto?.sku || ''} required />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Quantidade</FormLabel>
                <NumberInput min={0} defaultValue={selectedProduto?.quantidade || 0}>
                  <NumberInputField name="quantidade" />
                </NumberInput>
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Preço de Custo</FormLabel>
                <NumberInput min={0} precision={2} defaultValue={selectedProduto?.preco_custo || 0}>
                  <NumberInputField name="preco_custo" />
                </NumberInput>
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Preço de Venda</FormLabel>
                <NumberInput min={0} precision={2} defaultValue={selectedProduto?.preco_venda || 0}>
                  <NumberInputField name="preco_venda" />
                </NumberInput>
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} type="submit" isLoading={loading}>
                {loading ? 'Aguarde' : 'Salvar'}
              </Button>
              <Button onClick={onClose}>Cancelar</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default GestaoEstoque;