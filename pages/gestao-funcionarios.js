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
import  supabase  from '../lib/supabaseClient';

const GestaoFuncionarios = () => {
  const [funcionarios, setFuncionarios] = useState([]);
  const [selectedFuncionario, setSelectedFuncionario] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchFuncionarios();
  }, []);

  const fetchFuncionarios = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('nome');

      if (error) throw error;
      setFuncionarios(data);
    } catch (error) {
      console.error('Error fetching funcionarios:', error);
      toast({
        title: 'Erro ao buscar funcionários',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleNovoFuncionario = () => {
    setSelectedFuncionario(null);
    onOpen();
  };

  const handleEditFuncionario = (funcionario) => {
    setSelectedFuncionario(funcionario);
    onOpen();
  };

  const handleDeleteFuncionario = async (id) => {
    try {
      const { error } = await supabase.from('usuarios').delete().eq('id', id);
      if (error) throw error;

      toast({
        title: 'Funcionário excluído com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchFuncionarios();
    } catch (error) {
      toast({
        title: 'Erro ao excluir funcionário',
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
    const funcionarioData = Object.fromEntries(formData.entries());

    try {
      if (selectedFuncionario) {
        // Update existing funcionario
        const { error } = await supabase
          .from('usuarios')
          .update(funcionarioData)
          .eq('id', selectedFuncionario.id);
        if (error) throw error;

        toast({
          title: 'Funcionário atualizado com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Add new funcionario
        const { data, error } = await supabase.auth.signUp({
          email: funcionarioData.email,
          password: funcionarioData.password,
          options: {
            data: {
              nome: funcionarioData.nome,
              nivel_acesso: funcionarioData.nivel_acesso,
            },
          },
        });
        if (error) throw error;

        const { error: insertError } = await supabase.from('usuarios').insert({
          id: data.user.id,
          nome: funcionarioData.nome,
          email: funcionarioData.email,
          telefone: funcionarioData.telefone,
          endereco: funcionarioData.endereco,
          nivel_acesso: funcionarioData.nivel_acesso,
        });
        if (insertError) throw insertError;

        toast({
          title: 'Funcionário adicionado com sucesso',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      onClose();
      fetchFuncionarios();
    } catch (error) {
      console.error(error);
      toast({
        title: `Erro ao ${selectedFuncionario ? 'atualizar' : 'adicionar'} funcionário`,
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
          Gestão de Funcionários
        </Heading>
        <Button leftIcon={<FiPlus />} colorScheme="teal" onClick={handleNovoFuncionario}>
          Novo Funcionário
        </Button>
      </Box>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Nome</Th>
            <Th>Email</Th>
            <Th>Telefone</Th>
            <Th>Nível de Acesso</Th>
            <Th>Ações</Th>
          </Tr>
        </Thead>
        <Tbody>
          {funcionarios.map((funcionario) => (
            <Tr key={funcionario.id}>
              <Td>{funcionario.nome}</Td>
              <Td>{funcionario.email}</Td>
              <Td>{funcionario.telefone}</Td>
              <Td>{funcionario.nivel_acesso}</Td>
              <Td>
                <IconButton
                  icon={<FiEdit />}
                  aria-label="Editar"
                  mr={2}
                  onClick={() => handleEditFuncionario(funcionario)}
                />
                <IconButton
                  icon={<FiTrash2 />}
                  aria-label="Excluir"
                  onClick={() => handleDeleteFuncionario(funcionario.id)}
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selectedFuncionario ? 'Editar Funcionário' : 'Novo Funcionário'}</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit}>
            <ModalBody>
              <FormControl>
                <FormLabel>Nome</FormLabel>
                <Input name="nome" defaultValue={selectedFuncionario?.nome} required />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Email</FormLabel>
                <Input name="email" type="email" defaultValue={selectedFuncionario?.email} required />
              </FormControl>
              {!selectedFuncionario && (
                <FormControl mt={4}>
                  <FormLabel>Senha</FormLabel>
                  <Input name="password" type="password" required />
                </FormControl>
              )}
              <FormControl mt={4}>
                <FormLabel>Telefone</FormLabel>
                <Input name="telefone" defaultValue={selectedFuncionario?.telefone} />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Endereço</FormLabel>
                <Input name="endereco" defaultValue={selectedFuncionario?.endereco} />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Nível de Acesso</FormLabel>
                <Select name="nivel_acesso" defaultValue={selectedFuncionario?.nivel_acesso} required>
                  <option value="admin">Admin</option>
                  <option value="funcionario">Funcionário</option>
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

export default GestaoFuncionarios;

