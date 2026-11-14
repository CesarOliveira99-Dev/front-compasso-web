import type { Metadata } from 'next';
import './globals.css';
import './compasso.css';
import './customer-experience.css';
import './typography.css';
import '@/modules/marketing/presentation/landing.css';
export const metadata: Metadata = {
  title: 'Compasso — Seu negócio, no seu ritmo',
  description: 'Agenda, clientes e cuidados em um só lugar.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
