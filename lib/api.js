// Server-side helpers used by Server Components.
// Everything now runs inside the Next.js process — no HTTP hop to an external backend.
import { getCurrentUser } from "./auth";

export async function getMe() {
  return getCurrentUser();
}
