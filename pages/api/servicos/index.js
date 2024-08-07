import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('sgq');
  const collection = db.collection('servicos');

  if (req.method === 'GET') {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
const{ search = '' } = req.query;
let query = {};
    if (search) {
      query = {
        $or: [
          { titulo: { $regex: search, $options: 'i' } },
          { preco: { $regex: search, $options: 'i' } },
          { categoria: { $regex: search, $options: 'i' } },
        ],
      };
    }
    const servicos = await collection.find(query).skip(skip).limit(limit).toArray();
    const total = await collection.countDocuments();

    res.status(200).json({ servicos, total });
  } else if (req.method === 'POST') {
    const newServico = req.body;
    const result = await collection.insertOne(newServico);
    res.status(200).json();
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}