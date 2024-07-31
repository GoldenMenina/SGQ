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
import  supabase  from '../lib/supabaseClient';

const GestaoEstoque = () => {
  const [produtos, setProdutos] = useState([]);
  const [selectedProduto, setSelectedProduto] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchProdutos();
  }, []);

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

  const handleNovoProduto = () => {
    setSelectedProduto(null);
    onOpen();
  };

  const handleEditProduto = (produto) => {
    setSelectedProduto(produto);
    onOpen();
  };

  const handleDeleteProduto = async (id) => {
    try {
      const { error } = await supabase.from('produtos').delete().eq('id', id);
      if (error) throw error;

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
    const formData = new FormData(event.target);
    const produtoData = Object.fromEntries(formData.entries());

    try {
      if (selectedProduto) {
        const { error } = await supabase
          .from('produtos')
          .update(produtoData)
          .eq('id', selectedProduto.id);
        if (error) throw error;

        toast({
          title: 'Produto atualizado com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        const { error } = await supabase.from('produtos').insert(produtoData);
        if (error) throw error;

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
    }
  };

  return (
    <Container maxW="container.xl">
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={5}>
        <Heading as="h1" size="xl">
          Gestão de Estoque
        </Heading>
        <Button leftIcon={<FiPlus />} colorScheme="teal" onClick={handleNovoProduto}>
          Novo Produto
        </Button>
      </Box>

      <Table variant="simple">
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
            <Tr key={produto.id}>
              <Td>{produto.nome}</Td>
              <Td>{produto.sku}</Td>
              <Td>{produto.quantidade}</Td>
              <Td>R$ {produto.preco_custo}</Td>
              <Td>R$ {produto.preco_venda}</Td>
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
                  onClick={() => handleDeleteProduto(produto.id)}
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
                <Input name="nome" defaultValue={selectedProduto?.nome} required />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>SKU</FormLabel>
                <Input name="sku" defaultValue={selectedProduto?.sku} required />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Quantidade</FormLabel>
                <NumberInput min={0}>
                  <NumberInputField name="quantidade" defaultValue={selectedProduto?.quantidade} required />
                </NumberInput>
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Preço de Custo</FormLabel>
                <NumberInput min={0} precision={2}>
                  <NumberInputField name="preco_custo" defaultValue={selectedProduto?.preco_custo} required />
                </NumberInput>
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Preço de Venda</FormLabel>
                <NumberInput min={0} precision={2}>
                  <NumberInputField name="preco_venda" defaultValue={selectedProduto?.preco_venda} required />
                </NumberInput>
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

export default GestaoEstoque;