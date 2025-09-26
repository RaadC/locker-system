import db from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { totalLocker, currentCharge } = req.body;

  try {
    if (typeof totalLocker === "number") {
      const [[{ maxId } = {}]] = await db.query(
        "SELECT MAX(id) AS maxId FROM lockerSlot WHERE status = 1"
      );

      const maxLockerId = maxId || 0;

      if (totalLocker >= maxLockerId) {
        const [result] = await db.query("UPDATE totalLocker SET total = ?", [
          totalLocker,
        ]);

        if (result.affectedRows === 0) {
          return res.json({
            message: "No row found to update.",
            updated: false,
          });
        }

        if (result.changedRows === 0) {
          return res.json({
            message: "Total value is already the same. No changes made.",
            updated: false,
          });
        }

        return res.json({
          message: "Total locker updated successfully.",
          updated: true,
          affectedRows: result.affectedRows,
        });
      } else {
        return res.json({
          message: `Provided value (${totalLocker}) is less than the highest active locker ID (${maxLockerId}).`,
          updated: false,
        });
      }
    }

    if (typeof currentCharge === "number") {
      await db.query("UPDATE currentCharge SET fee = ?", [currentCharge]);
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "update_failed" });
  }
}
