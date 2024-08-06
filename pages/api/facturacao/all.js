import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';


export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('sgq');
 
const objectId = new ObjectId('66b272905a6d3d8b3bb84412')

  if (req.method === 'GET') {
    const servicos = await db.collection('servicos').find({}).toArray()
    
      const produtos = await db.collection('produtos').find({}).toArray()
      
        const empresa = await db.collection('empresa').findOne({ _id: objectId});
      const clientes = await db.collection('clientes').find({}).toArray()
    res.status(200).json({empresa,produtos,servicos,clientes});
  }else if(req.method === 'PUT'){
      const result = await collection.findOneAndUpdate(
      { _id: objectId },
      { $set: req.body },
      { returnOriginal: false }
    );
    res.status(200).json(result.value);
  }
}