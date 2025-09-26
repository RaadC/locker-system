import db from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let { textInput } = req.body;
  if (!textInput) return res.status(400).json({ error: "no_input_provided" });

  const match = textInput.match(/TUPC-\d{2}-\d{4}/i);
  if (!match) return res.json({ error: "invalid_format" });

  const tupcId = match[0];

  try {
    const [rows] = await db.query("SELECT balance FROM users WHERE tupcID = ?", [tupcId]);
    if (!rows.length) return res.json({ message: "record_unavailable" });

    const balance = parseFloat(rows[0].balance) || 0;
    return res.json({ balanceRem: balance });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
}
