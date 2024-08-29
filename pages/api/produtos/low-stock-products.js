// pages/api/low-stock-products.js
import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const client = await clientPromise;
      const db = client.db('sgq');
      const collection = db.collection('produtos');

      const lowStockProducts = await collection
        .find({ quantidade: { $lt: 11 } })
        .project({ nome: 1, quantidade: 1 })
        .toArray();

      res.status(200).json(lowStockProducts);
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}