import React from 'react';
import { Box, Heading, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { Pie, Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

const Estatisticas = () => {
  // Dados de exemplo (substitua pelos dados reais do seu MongoDB)
  const dadosFaturas = [
    { status: 'pago', total: 664664 },
    { status: 'não pago', total: 500000 },
    { status: 'atrasado', total: 200000 },
  ];

  const dadosServicos = [
    { titulo: 'Contabilidade', preco: 664664 },
    { titulo: 'Consultoria', preco: 500000 },
    { titulo: 'Auditoria', preco: 750000 },
  ];

  const dadosProdutos = [
    { nome: 'Sopa', quantidade: 20, preco_venda: 20000 },
    { nome: 'Salada', quantidade: 15, preco_venda: 15000 },
    { nome: 'Sobremesa', quantidade: 25, preco_venda: 25000 },
  ];

  const receitaMensal = [
    { mes: 'Jan', receita: 1000000 },
    { mes: 'Fev', receita: 1200000 },
    { mes: 'Mar', receita: 900000 },
    { mes: 'Abr', receita: 1500000 },
  ];

  // Configurações dos gráficos
  const graficoStatusFaturas = {
    labels: dadosFaturas.map(item => item.status),
    datasets: [
      {
        data: dadosFaturas.map(item => item.total),
        backgroundColor: ['#319795', '#4FD1C5', '#81E6D9'],
      },
    ],
  };

  const graficoReceitaServicos = {
    labels: dadosServicos.map(item => item.titulo),
    datasets: [
      {
        label: 'Receita de Serviços',
        data: dadosServicos.map(item => item.preco),
        backgroundColor: 'rgba(49, 151, 149, 0.6)',
        borderColor: 'rgba(49, 151, 149, 1)',
        borderWidth: 1,
      },
    ],
  };

  const graficoInventarioProdutos = {
    labels: dadosProdutos.map(item => item.nome),
    datasets: [
      {
        label: 'Quantidade',
        data: dadosProdutos.map(item => item.quantidade),
        backgroundColor: 'rgba(49, 151, 149, 0.6)',
        borderColor: 'rgba(49, 151, 149, 1)',
        borderWidth: 1,
      },
    ],
  };

  const graficoReceitaNoTempo = {
    labels: receitaMensal.map(item => item.mes),
    datasets: [
      {
        label: 'Receita Mensal',
        data: receitaMensal.map(item => item.receita),
        fill: false,
        borderColor: 'rgb(49, 151, 149)',
        tension: 0.1,
      },
    ],
  };

  return (
    <Box p={8} bg="gray.50" minHeight="100vh">
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="2xl" textAlign="center" color="teal.600">
          Estatísticas Empresariais
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
            <Heading as="h3" size="lg" mb={4} color="teal.500">
              Status das Faturas
            </Heading>
            <Pie data={graficoStatusFaturas} />
          </Box>
          <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
            <Heading as="h3" size="lg" mb={4} color="teal.500">
              Receita de Serviços
            </Heading>
            <Bar data={graficoReceitaServicos} />
          </Box>
          <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
            <Heading as="h3" size="lg" mb={4} color="teal.500">
              Inventário de Produtos
            </Heading>
            <Doughnut data={graficoInventarioProdutos} />
          </Box>
          <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
            <Heading as="h3" size="lg" mb={4} color="teal.500">
              Receita ao Longo do Tempo
            </Heading>
            <Line data={graficoReceitaNoTempo} />
          </Box>
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default Estatisticas;