import type { Types as TListSnapshots } from "./types/snapshots";

export async function listSnapshots() {
  const res = await fetch("http://localhost:30112/api/snapshots");
  return res.json() as Promise<TListSnapshots>;
}
