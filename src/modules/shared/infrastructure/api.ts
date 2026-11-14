let workspaceScope: string | undefined;
export function setApiWorkspaceScope(tenantId?: string) {
  workspaceScope = tenantId;
}
export function workspaceRequestHeaders(): Record<string, string> {
  return workspaceScope ? { "X-Compasso-Workspace": workspaceScope } : {};
}
export async function api<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const response = await fetch(`/api/${path}`, {
    method,
    credentials: "same-origin",
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...workspaceRequestHeaders(),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      typeof data.message === "string"
        ? data.message
        : "Não foi possível concluir. Tente novamente.",
    );
  if (path === "auth/logout") setApiWorkspaceScope();
  else if (
    path.startsWith("auth/") &&
    !path.startsWith("auth/workspaces") &&
    data.user?.tenantId
  )
    setApiWorkspaceScope(data.user.tenantId);
  return data as T;
}
