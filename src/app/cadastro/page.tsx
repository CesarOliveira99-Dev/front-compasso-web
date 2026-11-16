import { Workspace } from "@/modules/workspace/presentation/workspace";
export const metadata = {
  title: "Começar — Compasso",
  robots: { index: false, follow: false },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const mode =
    params.modalidade === "solo"
      ? "solo"
      : params.modalidade === "cliente"
        ? "customer"
        : "store";
  return <Workspace signupMode={mode} />;
}
