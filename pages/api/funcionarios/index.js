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
    var newFuncionario = req.body;
    const existingUser = await collection.findOne({ email: newFuncionario.email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'usuario ja existe' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newFuncionario.password, salt);
    newFuncionario.password = hashedPassword;

    const result = await collection.insertOne(newFuncionario);
    res.status(201).json({ success: true, message: 'usuario criado com sucesso', data: result.ops[0] });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}