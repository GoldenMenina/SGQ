import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const client = await clientPromise;
    const db = client.db('sgq');
    const facturasCollection = db.collection('facturas');
    const clientesCollection = db.collection('clientes');

    // Get current date and time
    const currentDate = new Date();
    
    // Create date boundaries for the next three days
    const oneDayFromNow = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
    const twoDaysFromNow = new Date(currentDate.getTime() + 2 * 24 * 60 * 60 * 1000);
    const threeDaysFromNow = new Date(currentDate.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Query for upcoming pickups
    const upcomingPickups = await facturasCollection.aggregate([
      {
        $match: {
          data: {
            $gte: currentDate,
            $lte: threeDaysFromNow
          }
        }
      },
      {
        $lookup: {
          from: 'clientes',
          localField: 'cliente_id',
          foreignField: '_id',
          as: 'cliente'
        }
      },
      {
        $unwind: '$cliente'
      },
      {
        $project: {
          _id: 1,
          data: 1,
          status: 1,
          'cliente.nome': 1,
          'cliente.telefone': 1,
          itens: 1,
          daysUntilPickup: {
            $switch: {
              branches: [
                { case: { $and: [{ $gte: ["$data", oneDayFromNow] }, { $lt: ["$data", twoDaysFromNow] }] }, then: 1 },
                { case: { $and: [{ $gte: ["$data", twoDaysFromNow] }, { $lt: ["$data", threeDaysFromNow] }] }, then: 2 },
                { case: { $and: [{ $gte: ["$data", threeDaysFromNow] }, { $lt: ["$data", new Date(threeDaysFromNow.getTime() + 24 * 60 * 60 * 1000)] }] }, then: 3 }
              ],
              default: 0
            }
          }
        }
      },
      {
        $sort: { daysUntilPickup: 1 }
      }
    ]).toArray();
    
    console.log(upcomingPickups);
    res.status(200).json(upcomingPickups);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
