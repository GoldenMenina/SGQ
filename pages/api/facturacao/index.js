import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('sgq');
  const collection = db.collection('facturas');

  if (req.method === 'GET') {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search = '', startDate = '', endDate = '' } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { nome: { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      query.data = {};
      if (startDate) {
        query.data.$gte = startDate;
      }
      if (endDate) {
        query.data.$lte = endDate;
      }
    }

    console.log('Query:', JSON.stringify(query, null, 2)); // For debugging

    const facturas = await collection.find(query).skip(skip).limit(limit).toArray();
    const total = await collection.countDocuments(query);

    res.status(200).json({ facturas, total });
  } else if (req.method === 'POST') {
    const newFactura = req.body;
    const result = await collection.insertOne(newFactura);
    res.status(201).json(result);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}