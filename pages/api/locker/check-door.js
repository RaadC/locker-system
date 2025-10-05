import db from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { pins } = req.body;
  if (!pins || !Array.isArray(pins)) {
    return res.status(400).json({ error: "invalid_payload_format" });
  }

  try {
    const updatePromises = pins.map(({ id, value }) =>
      db.query("UPDATE lockerslot SET initial = ? WHERE id = ?", [value, id])
    );

    await Promise.all(updatePromises);

    return res.json({ success: true, message: "Pins updated successfully", updated: pins.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server_error" });
  }
}
