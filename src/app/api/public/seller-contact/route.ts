import { ok } from "@/lib/api-response";
import { getSellerContact } from "@/server/services/seller-contact.service";

export async function GET() {
  const contact = await getSellerContact();
  return ok({
    telegramUrl: contact.telegramUrl,
    telegramHandle: contact.telegramHandle,
    zaloDisplay: contact.zaloDisplay,
    zaloUrl: contact.zaloUrl,
    facebookUrl: contact.facebookUrl,
    facebookLabel: contact.facebookLabel,
    phone: contact.phone,
    note: contact.note,
  });
}
