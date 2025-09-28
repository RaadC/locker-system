import db from "@/lib/db";
import store from "@/lib/store";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let { textInput } = req.body;
  if (!textInput) return res.status(400).json({ error: "no_input_provided" });

  store.lastTextInput = textInput;

  // Extract just the ID part (TUPC-XX-XXXX)
  const match = textInput.match(/TUPC-\d{2}-\d{4}/i);
  if (!match) {
    store.lockerToOpen = { error: "invalid_format" };
    return res.json(store.lockerToOpen);
  }
  const tupcId = match[0];

  try {
    // Check if registered
    const [userRows] = await db.query("SELECT * FROM users WHERE tupcID = ?", [tupcId]);
    if (!userRows.length) {
      store.lockerToOpen = { error: "unregistered_user" };
      return res.json(store.lockerToOpen);
    }

    const user = userRows[0];
    const userId = user.id;
    const balance = parseFloat(user.balance);

    const [feeRow] = await db.query("SELECT fee FROM currentcharge LIMIT 1");
    const fee = feeRow.length ? parseFloat(feeRow[0].fee) : 5;

    if (isNaN(balance)) {
      store.lockerToOpen = { error: "invalid_balance_format", balanceRem: balance };
      return res.json(store.lockerToOpen);
    }

    // Check if retrieving
    const [existingSlot] = await db.query("SELECT * FROM lockerslot WHERE tupcID = ?", [tupcId]);

    if (existingSlot.length) {
      const lockerId = existingSlot[0].id;
      await db.query("UPDATE lockerslot SET tupcID = NULL, status = 0 WHERE id = ?", [lockerId]);
      await db.query(
        "INSERT INTO lockerhistory (tupcID, slotNumber, action) VALUES (?, ?, 'retrieved')",
        [tupcId, lockerId]
      );

      store.lockerToOpen = { lockerToOpen: lockerId, balanceRem: balance };
      return res.json(store.lockerToOpen);
    }

    // Check if storing (balance vs fee)
    if (balance < fee) {
      store.lockerToOpen = { error: "insufficient_balance", balanceRem: balance };
      return res.json(store.lockerToOpen);
    }

    // Find available slot
    const [available] = await db.query(`
      SELECT id FROM lockerslot
      WHERE status = 0
        AND id <= (SELECT total FROM totallocker LIMIT 1)
      ORDER BY id ASC
      LIMIT 1
    `);

    if (!available.length) {
      store.lockerToOpen = { error: "no_available_slot", balanceRem: balance };
      return res.json(store.lockerToOpen);
    }

    const lockerId = available[0].id;
    await db.query("UPDATE lockerslot SET tupcID = ?, status = 1, dateTime = NOW() WHERE id = ?", [
      tupcId,
      lockerId,
    ]);
    await db.query("UPDATE users SET balance = balance - ? WHERE id = ?", [fee, userId]);
    await db.query(
      "INSERT INTO lockerhistory (tupcID, slotNumber, action) VALUES (?, ?, 'stored')",
      [tupcId, lockerId]
    );

    store.lockerToOpen = { lockerToOpen: lockerId, balanceRem: balance };
    return res.json(store.lockerToOpen);
  } catch (err) {
    console.error(err);
    store.lockerToOpen = { error: "server_error" };
    return res.status(500).json(store.lockerToOpen);
  }
}
