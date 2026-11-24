import { MessageCircle, ArrowUpRight } from "lucide-react";
import { whatsappUrl } from "../domain/whatsapp";
export function WhatsAppLink({
  phone,
  message,
  label = "Conversar no WhatsApp",
}: {
  phone?: string | null;
  message?: string;
  label?: string;
}) {
  const href = whatsappUrl(phone, message);
  if (!href) return null;
  return (
    <a
      className="button secondary"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <MessageCircle size={17} />
      {label}
      <ArrowUpRight size={15} />
    </a>
  );
}
