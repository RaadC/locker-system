import db from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const [rows] = await db.query(`
      SELECT id, tupcID 
      FROM lockerslot 
      WHERE id <= (SELECT total FROM totallocker LIMIT 1) 
      ORDER BY id ASC
    `);
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error in /api/display/all-lockers:", err);
    res.status(500).json({ error: "server_error" });
  }
}
