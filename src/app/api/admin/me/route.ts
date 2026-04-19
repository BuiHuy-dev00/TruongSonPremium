import { auth } from "@/auth";
import { fail, ok } from "@/lib/api-response";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return fail("Chưa đăng nhập", 401);
  }
  return ok({
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  });
}
