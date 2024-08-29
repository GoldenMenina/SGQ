import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('sgq');
  const collection = db.collection('facturas');
  const facturasCollection = db.collection('facturas');
  const produtosCollection = db.collection('produtos');
  if (req.method === 'GET') {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { search = '', startDate = '', endDate = '' } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { nome: { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      query.data = {};
      if (startDate) {
        query.data.$gte = startDate;
      }
      if (endDate) {
        query.data.$lte = endDate;
      }
    }
//++
    console.log('Query:', JSON.stringify(query, null, 2)); // For debugging

    const facturas = await collection.find(query).skip(skip).limit(limit).toArray();
    const total = await collection.countDocuments(query);

    res.status(200).json({ facturas, total });
  } else if (req.method === 'POST') {
    var newFactura = req.body;
    const session = client.startSession();
      newFactura.data = new Date(newFactura.data);
    try {
      await session.withTransaction(async () => {
        // Insert the new factura
        const result = await facturasCollection.insertOne(newFactura, { session });

        // Update product quantities
        for (const item of newFactura.itens) {
          if (item.tipo === 'produto') {
            const produtoId = new ObjectId(item.produto_id);
            const quantidadeVendida = item.quantidade;

            const updateResult = await produtosCollection.updateOne(
              { _id: produtoId },
              { $inc: { quantidade: -quantidadeVendida } },
              { session }
            );

            if (updateResult.modifiedCount === 0) {
              throw new Error(`Failed to update quantity for product ${item.produto_id}`);
            }
          }
        }
      });

      res.status(201).json({ message: 'Factura created and product quantities updated successfully' });
    } catch (error) {
      console.error('Transaction failed:', error);
      res.status(500).json({ message: 'Failed to create factura and update product quantities', error: error.message });
    } finally {
      await session.endSession();
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}