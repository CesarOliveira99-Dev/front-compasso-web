export default function InformationLayout({ children }: { children: React.ReactNode }) {
  return <main style={{ maxWidth: '760px', margin: '2rem auto', padding: '1.5rem', lineHeight: 1.8, overflowWrap: 'anywhere' }}>
    <a href="/">← Voltar ao Compasso</a>
    {children}
    <p>Entre em contato com o nosso suporte: <a href="mailto:contato.suporte.compasso@gmail.com">contato.suporte.compasso@gmail.com</a></p>
  </main>;
}

