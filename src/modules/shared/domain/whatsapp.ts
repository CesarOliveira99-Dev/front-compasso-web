/** Manual Brazilian WhatsApp conversation. Never sends a message automatically. */
export function whatsappUrl(
  phone?: string | null,
  message?: string,
): string | undefined {
  if (!phone || !/^[+\d\s().-]+$/.test(phone)) return undefined;
  const digits = phone.replace(/\D/g, "");
  const national = digits.length === 10 || digits.length === 11;
  const international =
    (digits.length === 12 || digits.length === 13) && digits.startsWith("55");
  if (!national && !international) return undefined;
  const number = national ? `55${digits}` : digits;
  return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}
