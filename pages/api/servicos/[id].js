import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'bson';
export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('sgq');
  const collection = db.collection('servicos');
  const { id } = req.query;
  if (req.method === 'PUT') {
    const updatedServico = req.body;
    console.log(ObjectId(id) )
    const result = await collection.updateOne(
      { _id: ObjectId(id) },
      { $set: updatedServico },
      { returnOriginal: false }
    );
    console.log(result)
    res.status(200).json(result.value);
  } else if (req.method === 'DELETE') {
    await collection.deleteOne({ _id: ObjectId(id) });
    res.status(204).end();
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}