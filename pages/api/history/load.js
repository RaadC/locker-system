import db from "@/lib/db";

export default async function handler(req, res) {
  if (req.method === "DELETE") {
    try {
      await db.query("DELETE FROM creditloadhistory");
      return res.status(200).json({ message: "Load history cleared" });
    } catch (err) {
      console.error("Error deleting load history:", err);
      return res.status(500).json({ error: "server_error" });
    }
  }

  res.setHeader("Allow", ["DELETE"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
