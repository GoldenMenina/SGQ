// pages/api/login.js
import clientPromise from '../../../lib/mongodb';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const client = await clientPromise;
  const db = client.db('sgq');
      const { email, password } = req.body;

      const user = await db.collection('funcionarios').findOne({ email });
console.log(user)
      if (user && bcrypt.compareSync(password, user.password)) {
        const { password, ...userWithoutPassword } = user;
        res.status(200).json({ success: true, user: userWithoutPassword });
      } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}