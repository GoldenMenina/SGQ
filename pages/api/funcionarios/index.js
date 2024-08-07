import clientPromise from '../../../lib/mongodb';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('sgq');
  const collection = db.collection('funcionarios');

  if (req.method === 'GET') {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const funcionarios = await collection.find().skip(skip).limit(limit).toArray();
    const total = await collection.countDocuments();

    res.status(200).json({ funcionarios, total });
  } else if (req.method === 'POST') {
    const existingUser = await db.collection.findOne({ newFuncionario.email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'usuario ja existe' });
      }
    var newFuncionario = req.body;
    
    const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newFuncionario.password, salt);
newFuncionario.password = hashedPassword
      
    
    
    const result = await collection.insertOne(newFuncionario);
    res.status(201).json();
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}