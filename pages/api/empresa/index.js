import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('sgq');
  const collection = db.collection('empresa');

 '66b272905a6d3d8b3bb84412'
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const funcionarios = await collection.find().skip(skip).limit(limit).toArray();
    const total = await collection.countDocuments();

    res.status(200).json({ funcionarios, total });
  
}