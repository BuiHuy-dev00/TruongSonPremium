import { ok } from "@/lib/api-response";
import { requireAdminSession } from "@/lib/require-admin";
import { getDashboardStats } from "@/server/services/dashboard.service";

export async function GET() {
  const gate = await requireAdminSession();
  if (!gate.ok) return gate.response;

  const stats = await getDashboardStats();
  return ok(stats);
}
