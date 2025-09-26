import store from "@/lib/store";

export default function handler(req, res) {
  res.json({ textInput: store.lastTextInput });
}
