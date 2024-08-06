import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('sgq');
  const collection = db.collection('funcionarios');

  if (req.method === 'GET') {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const clientes = await collection.find().skip(skip).limit(limit).toArray();
    const total = await collection.countDocuments();

    res.status(200).json({ clientes, total });
  } else if (req.method === 'POST') {
    const newCliente = req.body;
    const result = await collection.insertOne(newCliente);
    res.status(201).json();
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}