/** Only supported staff tools cross the BFF; the API still enforces actor/tenant scope. */
export function isWorkspacePath(path: string) {
  return /^workspace\/(preferences|analytics|export|contacts|customers(?:\/[\w-]+(?:\/(?:reward|redeem))?)?|appointments\/[\w-]+\/style)$/.test(
    path,
  );
}
