import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';


export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('sgq');
  const collection = db.collection('empresa');
const objectId = new ObjectId('66b272905a6d3d8b3bb84412')
  if (req.method === 'GET') {
    const empresa = await collection.findOne({_id:objectId});
    res.status(200).json(empresa);
  }
}