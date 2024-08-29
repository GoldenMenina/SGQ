import clientPromise from '../../../lib/mongodb';
import moment from 'moment-timezone';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const client = await clientPromise;
    const db = client.db('sgq');
    const facturasCollection = db.collection('facturas');

    // Define Luanda timezone
    const luandaTimezone = 'Africa/Luanda';

    // Get current date and time in Luanda timezone
    const currentDate = moment.tz(luandaTimezone).startOf('day').toDate(); // Start of today in Luanda timezone
    const threeDaysFromNow = moment.tz(luandaTimezone).add(3, 'days').startOf('day').toDate(); // 3 days from now in Luanda timezone

    const upcomingPickups = await facturasCollection.aggregate([
      {
        $match: {
          date: {
            $gte: currentDate,
            $lt: threeDaysFromNow // Up to 3 days from now
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
        $addFields: {
          // Calculate daysUntilPickup
          daysUntilPickup: {
            $dateDiff: {
              startDate: currentDate,
              endDate: "$date",
              unit: "day"
            }
          }
        }
      },
      {
        $match: {
          // Filter to include only documents where daysUntilPickup is within the range [1, 3]
          daysUntilPickup: {
            $gte: 1,
            $lte: 3
          }
        }
      },
      {
        $project: {
          _id: 1,
          data: 1,
          status: 1,
          'cliente.nome': 1,
          'cliente.telefone': 1,
          itens: 1,
          daysUntilPickup: 1
        }
      },
      {
        $sort: { daysUntilPickup: 1 } // Sort by daysUntilPickup in ascending order
      }
    ]).toArray();
console.log(upcomingPickups)
    res.status(200).json(upcomingPickups);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
