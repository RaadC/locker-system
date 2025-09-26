import db from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const [lockerRows] = await db.query("SELECT total FROM totalLocker LIMIT 1");
    const [chargeRows] = await db.query("SELECT fee FROM currentCharge LIMIT 1");

    res.status(200).json({
      totalLocker: lockerRows[0]?.total ?? null,
      currentCharge: chargeRows[0]?.fee ?? null,
    });
  } catch (err) {
    console.error("Error in /api/display/total-charge:", err);
    res.status(500).json({ error: "server_error" });
  }
}
