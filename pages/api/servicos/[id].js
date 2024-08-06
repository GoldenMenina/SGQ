import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('sgq');
  const collection = db.collection('servicos');
  const { id } = req.query;
  const objectId = new ObjectId(id);
  if (req.method === 'PUT') {
    const updatedServico = req.body;

    const result = await collection.updateOne(
      { _id: objectId },
      { $set: updatedServico },
      { returnOriginal: false }
    );
    console.log(result)
    res.status(200).json(result.value);
  } else if (req.method === 'DELETE') {
    await collection.deleteOne({ _id: objectId});
    res.status(204).end();
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}