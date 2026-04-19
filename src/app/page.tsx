import { HomeExperience } from "@/components/shop/home-experience";
import { getHomePagePayload } from "@/server/services/catalog.service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const initial = await getHomePagePayload();
  return <HomeExperience initial={initial} />;
}
