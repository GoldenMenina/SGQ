import React from 'react';
import { Box, Heading, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { Pie, Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

const Statistics = () => {
  // Sample data (replace with actual data from your MongoDB)
  const invoiceData = [
    { status: 'paid', total: 664664 },
    { status: 'unpaid', total: 500000 },
    { status: 'overdue', total: 200000 },
  ];

  const serviceData = [
    { titulo: 'Contabilidade', preco: 664664 },
    { titulo: 'Consultoria', preco: 500000 },
    { titulo: 'Auditoria', preco: 750000 },
  ];

  const productData = [
    { nome: 'Soup', quantidade: 20, preco_venda: 20000 },
    { nome: 'Salad', quantidade: 15, preco_venda: 15000 },
    { nome: 'Dessert', quantidade: 25, preco_venda: 25000 },
  ];

  const monthlyRevenue = [
    { month: 'Jan', revenue: 1000000 },
    { month: 'Feb', revenue: 1200000 },
    { month: 'Mar', revenue: 900000 },
    { month: 'Apr', revenue: 1500000 },
  ];

  // Chart configurations
  const invoiceStatusChart = {
    labels: invoiceData.map(item => item.status),
    datasets: [
      {
        data: invoiceData.map(item => item.total),
        backgroundColor: ['#319795', '#4FD1C5', '#81E6D9'],
      },
    ],
  };

  const serviceRevenueChart = {
    labels: serviceData.map(item => item.titulo),
    datasets: [
      {
        label: 'Service Revenue',
        data: serviceData.map(item => item.preco),
        backgroundColor: 'rgba(49, 151, 149, 0.6)',
        borderColor: 'rgba(49, 151, 149, 1)',
        borderWidth: 1,
      },
    ],
  };

  const productInventoryChart = {
    labels: productData.map(item => item.nome),
    datasets: [
      {
        label: 'Quantity',
        data: productData.map(item => item.quantidade),
        backgroundColor: 'rgba(49, 151, 149, 0.6)',
        borderColor: 'rgba(49, 151, 149, 1)',
        borderWidth: 1,
      },
    ],
  };

  const revenueOverTimeChart = {
    labels: monthlyRevenue.map(item => item.month),
    datasets: [
      {
        label: 'Monthly Revenue',
        data: monthlyRevenue.map(item => item.revenue),
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
          Business Statistics
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
            <Heading as="h3" size="lg" mb={4} color="teal.500">
              Invoice Status
            </Heading>
            <Pie data={invoiceStatusChart} />
          </Box>
          <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
            <Heading as="h3" size="lg" mb={4} color="teal.500">
              Service Revenue
            </Heading>
            <Bar data={serviceRevenueChart} />
          </Box>
          <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
            <Heading as="h3" size="lg" mb={4} color="teal.500">
              Product Inventory
            </Heading>
            <Doughnut data={productInventoryChart} />
          </Box>
          <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
            <Heading as="h3" size="lg" mb={4} color="teal.500">
              Revenue Over Time
            </Heading>
            <Line data={revenueOverTimeChart} />
          </Box>
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default Statistics;