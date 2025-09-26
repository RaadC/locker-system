import db from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { tupcID, balance } = req.body;

  if (!tupcID || balance == null) {
    return res.status(400).json({ message: "Missing tupcID or balance." });
  }

  try {
    const [existing] = await db.query("SELECT * FROM users WHERE tupcID = ?", [
      tupcID,
    ]);

    if (existing.length > 0) {
      return res.status(409).json({ message: "User already exists." });
    }

    await db.query("INSERT INTO users (tupcID, balance) VALUES (?, ?)", [
      tupcID,
      balance,
    ]);
    await db.query(
      "INSERT INTO creditLoadHistory (tupcID, addedAmount) VALUES (?, ?)",
      [tupcID, balance]
    );
    return res.status(201).json({ message: "User inserted successfully." });
  } catch (err) {
    console.error("Error inserting user:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
}
