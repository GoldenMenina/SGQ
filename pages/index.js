import React from 'react';
import { Box, Heading, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { Pie, Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

import clientPromise from '../lib/mongodb';

const Estatisticas = ({
      invoiceData,
      serviceData,
      productData,
      monthlyRevenue
    }) => {
  // Dados de exemplo (substitua pelos dados reais do seu MongoDB)
  
  // Configurações dos gráficos
  const graficoStatusFaturas = {
    labels: invoiceData.map(item => item.status),
    datasets: [
      {
        data: invoiceData.map(item => item.total),
        backgroundColor: ['#319795', '#4FD1C5', '#81E6D9'],
      },
    ],
  };

  const graficoReceitaServicos = {
    labels: serviceData.map(item => item.titulo),
    datasets: [
      {
        label: 'Receita de Serviços',
        data: serviceData.map(item => item.preco),
        backgroundColor: 'rgba(49, 151, 149, 0.6)',
        borderColor: 'rgba(49, 151, 149, 1)',
        borderWidth: 1,
      },
    ],
  };

  const graficoInventarioProdutos = {
    labels: productData.map(item => item.nome),
    datasets: [
      {
        label: 'Quantidade',
        data: productData.map(item => item.quantidade),
        backgroundColor: 'rgba(49, 151, 149, 0.6)',
        borderColor: 'rgba(49, 151, 149, 1)',
        borderWidth: 1,
      },
    ],
  };

  const graficoReceitaNoTempo = {
    labels: monthlyRevenue.map(item => item.mes),
    datasets: [
      {
        label: 'Receita Mensal',
        data: monthlyRevenue.map(item => item.receita),
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


export async function getServerSideProps() {
  const client = await clientPromise;
  const db = client.db('sgq');
  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31);

  const invoices = await db.collection('factura').find({
    data: {
      $gte: startOfYear,
      $lte: endOfYear
    },
    status: 'paid' // Only consider paid invoices
  }).toArray();

  // Calculate monthly revenue
  const monthlyRevenue = Array(12).fill(0).map((_, index) => ({
    month: new Date(currentYear, index).toLocaleString('default', { month: 'short' }),
    revenue: 0
  }));
  
  invoices.forEach(invoice => {
    const invoiceDate = new Date(invoice.data);
    const monthIndex = invoiceDate.getMonth();
    monthlyRevenue[monthIndex].revenue += invoice.total;
  });

  
  const invoiceData = await db.collection('factura').aggregate([
    { $group: { _id: '$status', total: { $sum: '$total' } } }
  ]).toArray();

  const serviceData = await db.collection('servicos').find().toArray();

  const productData = await db.collection('produtos').find().toArray();

  // You'll need to implement the logic for monthly revenue data

  return {
    props: {
      invoiceData,
      serviceData,
      productData,
      monthlyRevenue
    },
  };
}