import db from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { tupcID, amount } = req.body;

  if (!tupcID || isNaN(amount)) {
    return res.status(400).json({ message: "Invalid input" });
  }

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE tupcID = ?", [
      tupcID,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    await db.query("UPDATE users SET balance = balance + ? WHERE tupcID = ?", [
      amount,
      tupcID,
    ]);
    await db.query(
      "INSERT INTO creditloadhistory (tupcID, addedAmount) VALUES (?, ?)",
      [tupcID, amount]
    );
    res.json({ message: "Balance updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
}
