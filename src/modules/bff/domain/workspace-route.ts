/** Only supported staff tools cross the BFF; the API still enforces actor/tenant scope. */
export function isWorkspacePath(path: string) {
  if (/^workspace\/care\/(template|returns|blocks(?:\/[\w-]+)?|series|customers\/[\w-]+|appointments\/[\w-]+\/(reminder|missed)|waitlist(?:\/[\w-]+(?:\/(slots|book))?)?)$/.test(path)) return true;
  return /^workspace\/(preferences|analytics|export|contacts|customers(?:\/[\w-]+(?:\/(?:reward|redeem))?)?|appointments\/[\w-]+\/style)$/.test(
    path,
  );
}
