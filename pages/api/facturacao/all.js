import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';


export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('sgq');
 

  if (req.method === 'GET') {
    const servicos = await db.collection('servicos').find({}).toArray()
    res.status(200).json(empresa);
  }else if(req.method === 'PUT'){
      const result = await collection.findOneAndUpdate(
      { _id: objectId },
      { $set: req.body },
      { returnOriginal: false }
    );
    res.status(200).json(result.value);
  }
}