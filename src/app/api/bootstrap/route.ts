import { backend } from "@/modules/bff/infrastructure/backend-client";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const user = await backend("auth/me");
    if (!user.ok)
      return NextResponse.json(
        {
          message:
            user.status === 429
              ? "Muitas solicitações. Aguarde para tentar novamente."
              : "Entre para continuar.",
        },
        {
          status: user.status,
          headers: user.headers.get("retry-after")
            ? { "Retry-After": user.headers.get("retry-after")! }
            : {},
        },
      );
    const actor = await user.json();
    if (actor.storeSelected === false)
      return NextResponse.json({ status: "discovery", user: actor });
    const paths = [
      "settings",
      ...(actor.role === "employee" ? [] : ["insights/dashboard"]),
      "catalog",
      "appointments",
      "notifications",
    ];
    const responses = await Promise.all(paths.map((path) => backend(path)));
    if (responses.some((r) => !r.ok)) {
      const limited = responses.find((r) => r.status === 429);
      return NextResponse.json(
        {
          message: limited
            ? "Muitas solicitações. Aguarde para tentar novamente."
            : "Não foi possível carregar seu espaço.",
        },
        {
          status: limited ? 429 : 503,
          headers: limited?.headers.get("retry-after")
            ? { "Retry-After": limited.headers.get("retry-after")! }
            : {},
        },
      );
    }
    const values = await Promise.all(responses.map((r) => r.json()));
    const [settings, dashboard, catalog, appointments, notifications] =
      actor.role === "employee"
        ? [values[0], {}, values[1], values[2], values[3]]
        : values;
    return NextResponse.json({
      user: actor,
      settings,
      dashboard,
      catalog,
      appointments,
      notifications,
    });
  } catch {
    return NextResponse.json(
      { message: "O servidor está indisponível." },
      { status: 503 },
    );
  }
}
