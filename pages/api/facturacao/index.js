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
const{ search = '' } = req.query;
const objectId = new ObjectId(search);
let query = {};
    if (search) {
      query = {
        $or: [
          { id: { $regex: objectId, $options: 'i' } },
          { data: { $regex: search, $options: 'i' } },
        ],
      };
    }
    const facturas = await collection.find(query).skip(skip).limit(limit).toArray();
    const total = await collection.countDocuments();

    res.status(200).json({ facturas, total });
  } else if (req.method === 'POST') {
    const newFactura = req.body;
    const result = await collection.insertOne(newFactura);
    res.status(201).json();
  }else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}