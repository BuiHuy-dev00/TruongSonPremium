import { ok } from "@/lib/api-response";
import { getHomePagePayload } from "@/server/services/catalog.service";

export async function GET() {
  const payload = await getHomePagePayload();
  return ok(payload);
}
