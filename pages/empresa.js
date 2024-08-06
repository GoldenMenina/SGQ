import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
  Image,
} from '@chakra-ui/react';
import supabase from '../lib/supabaseClient';
import axios from 'axios'

const Empresa = () => {
  const [empresa, setEmpresa] = useState({
    nome: '',
    endereco: '',
    telefone: '',
    email: '',
    foto_url: '',
    banco_nome: '',
    banco_iban: '',
    banco_bic: '',
  });
  const [file, setFile] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchEmpresa();
  }, []);

  const fetchEmpresa = async () => {
    try {
      const response = await axios.get(`/api/empresa`);
      setEmpresa(response.data)
    } catch (error) {
      console.error('Erro ao buscar empresa:', error);
      toast({
        title: 'Erro ao buscar empresa',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmpresa((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'utjuauqd');

    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/dbagu0ju8/image/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
      toast({
        title: 'Erro ao enviar imagem',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let foto_url = empresa.foto_url;

    if (file) {
      foto_url = await uploadImage(file);
      if (!foto_url) return;
    }
    
    var empresainfo = empresa
    empresainfo.foto_url = foto_url
    console.log(empresainfo)

    try {
       const response = await axios.put(`/api/empresa`,empresainfo);

      toast({
        title: 'Informações da empresa salvas com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao salvar informações da empresa:', error);
      toast({
        title: 'Erro ao salvar informações da empresa',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.md" mt={5}>
      <Heading as="h1" size="xl" mb={5}>
        Informações da Empresa
      </Heading>
      <form onSubmit={handleSubmit}>
        <FormControl mb={4}>
          <FormLabel>Nome da Empresa</FormLabel>
          <Input
            name="nome"
            value={empresa.nome}
            onChange={handleChange}
            required
          />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Endereço</FormLabel>
          <Textarea
            name="endereco"
            value={empresa.endereco}
            onChange={handleChange}
          />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Telefone</FormLabel>
          <Input
            name="telefone"
            value={empresa.telefone}
            onChange={handleChange}
          />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Email</FormLabel>
          <Input
            name="email"
            type="email"
            value={empresa.email}
            onChange={handleChange}
          />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Foto</FormLabel>
          <Input
            type="file"
            onChange={handleFileChange}
          />
          {empresa.foto_url && (
            <Image src={empresa.foto_url} alt="Foto da Empresa" mt={4} />
          )}
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Nome do Banco</FormLabel>
          <Input
            name="banco_nome"
            value={empresa.banco_nome}
            onChange={handleChange}
          />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>IBAN</FormLabel>
          <Input
            name="banco_iban"
            value={empresa.banco_iban}
            onChange={handleChange}
          />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>BIC/SWIFT</FormLabel>
          <Input
            name="banco_bic"
            value={empresa.banco_bic}
            onChange={handleChange}
          />
        </FormControl>
        <Button colorScheme="blue" type="submit">
          Salvar
        </Button>
      </form>
    </Container>
  );
};

export default Empresa;