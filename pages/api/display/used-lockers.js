import db from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const [rows] = await db.query(`
      SELECT id, tupcID, dateTime 
      FROM lockerslot 
      WHERE status = 1
    `);
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error in /api/display/used-lockers:", err);
    res.status(500).json({ error: "server_error" });
  }
}
