import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('sgq');
  const collection = db.collection('produtos');

  if (req.method === 'GET') {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
const{ search = '' } = req.query;
let query = {};
    if (search) {
      query = {
        $or: [
          { nome: { $regex: search, $options: 'i' } },
          { sku: { $regex: search, $options: 'i' } },
          { categoria: { $regex: search, $options: 'i' } },
        ],
      };
    }
    const produtos = await collection.find(query).skip(skip).limit(limit).toArray();
    const total = await collection.countDocuments();

    res.status(200).json({ produtos, total });
  } else if (req.method === 'POST') {
    const newProdutos = req.body;
    const result = await collection.insertOne(newProdutos);
    res.status(201).json();
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}