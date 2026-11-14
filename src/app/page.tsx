import { cookies } from "next/headers";
import { Workspace } from "@/modules/workspace/presentation/workspace";
import { LandingPage } from "@/modules/marketing/presentation/landing-page";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const session = (await cookies()).get("compasso_session");
  if (session || params.loja || params.agendar) return <Workspace />;
  return <LandingPage />;
}
