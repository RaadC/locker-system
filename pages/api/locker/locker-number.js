import store from "@/lib/store";

export default function handler(req, res) {
  if (store.lockerToOpen !== null) {
    const response = store.lockerToOpen;
    store.lockerToOpen = null;
    return res.json(response);
  }
  res.json({ lockerToOpen: null });
}
