import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('sgq');
  const collection = db.collection('clientes');
  const { id } = req.query;

  if (req.method === 'PUT') {
    const updatedCliente = req.body;
    const result = await collection.findOneAndUpdate(
      { _id: ObjectId(id) },
      { $set: updatedCliente },
      { returnOriginal: false }
    );
    res.status(200).json(result.value);
  } else if (req.method === 'DELETE') {
    await collection.deleteOne({ _id: ObjectId(id) });
    res.status(204).end();
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}