import type { Types } from "./types/snapshots";
import type { Browse } from "./types/browse";

export async function listSnapshots() {
  const res = await fetch("http://localhost:30112/api/snapshots");
  return res.json() as Promise<Types>;
}

export async function browseSnapshot(id: string, path: string) {
  const res = await fetch(`http://localhost:30112/api/snapshots/${id}:${path}`);
  return res.json() as Promise<Browse>;
}
