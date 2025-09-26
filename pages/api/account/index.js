import db from "@/lib/db";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const [rows] = await db.query("SELECT id, email, role FROM admin ORDER BY id DESC");
      return res.status(200).json(rows);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "server_error" });
    }
  }

  if (req.method === "POST") {
    try {
      const { email, password, role } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "missing_fields" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await db.query(
        "INSERT INTO admin (email, password_hash, role) VALUES (?, ?, ?)",
        [email, hashedPassword, role || 0]
      );

      return res.status(201).json({ message: "Admin added successfully" });
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ error: "email_already_exists" });
      }
      console.error(err);
      return res.status(500).json({ error: "server_error" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
