import db from "@/lib/db";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === "PUT") {
    try {
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ error: "missing_password" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const [result] = await db.query(
        "UPDATE admin SET password_hash = ? WHERE id = ?",
        [hashedPassword, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "admin_not_found" });
      }

      return res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "server_error" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const [result] = await db.query("DELETE FROM admin WHERE id = ?", [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "admin_not_found" });
      }

      return res.status(200).json({ message: "Admin deleted successfully" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "server_error" });
    }
  }

  res.setHeader("Allow", ["PUT", "DELETE"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
