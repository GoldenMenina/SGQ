import { ObjectId } from 'mongodb';
import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('sgq');
  const collection = db.collection('servicos');
  const { id } = req.query;

  try {
    if (req.method === 'PUT') {
      const updatedServico = req.body;
      const objectId = new ObjectId(id);
      console.log('Updating service with ID:', objectId);

      const result = await collection.findOneAndUpdate(
        { _id: objectId },
        { $set: updatedServico },
        { returnDocument: 'after' }  // Use returnDocument instead of returnOriginal
      );

      if (result.value) {
        console.log('Update result:', result);
        res.status(200).json(result.value);
      } else {
        res.status(404).json({ error: 'Service not found' });
      }
    } else if (req.method === 'DELETE') {
      const objectId = new ObjectId(id);
      console.log('Deleting service with ID:', objectId);

      const result = await collection.deleteOne({ _id: objectId });

      if (result.deletedCount === 1) {
        res.status(204).end();
      } else {
        res.status(404).json({ error: 'Service not found' });
      }
    } else {
      res.setHeader('Allow', ['PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}