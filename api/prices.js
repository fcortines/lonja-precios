import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const { lonja_id } = req.query;
  
  if (!lonja_id) {
    return res.status(400).json({ error: 'lonja_id required' });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    
    const rows = await sql`
      SELECT session_date::text, product_key, price, volume
      FROM prices
      WHERE lonja_id = ${lonja_id}
      ORDER BY session_date ASC
    `;

    res.status(200).json(rows);
  } catch (error) {
    console.error('DB error:', error);
    res.status(500).json({ error: error.message });
  }
}
