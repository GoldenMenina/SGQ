import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const client = await clientPromise;
    const db = client.db('sgq');
    const facturasCollection = db.collection('facturas');

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set to start of day

    const threeDaysFromNow = new Date(currentDate);
    threeDaysFromNow.setDate(currentDate.getDate() + 3);

    const upcomingPickups = await facturasCollection.aggregate([
      {
        $addFields: {
          dateParsed: { $dateFromString: { dateString: "$data" } }
        }
      },
      {
        $addFields: {
          currentDate: currentDate,
          threeDaysFromNow: threeDaysFromNow
        }
      },
      {
        $match: {
          dateParsed: {
            $gte: currentDate,
            $lt: threeDaysFromNow
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
            $dateDiff: {
              startDate: currentDate,
              endDate: "$dateParsed",
              unit: "day"
            }
          },
          dateParsed: 1,        // Include to see parsed date
          currentDate: 1,       // Include to see current date
          threeDaysFromNow: 1  // Include to see date range end
        }
      },
      {
        $sort: { daysUntilPickup: 1 }
      }
    ]).toArray();

    res.status(200).json(upcomingPickups);
    console.log(upcomingPickups)
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
