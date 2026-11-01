'use client';
import { PageHeading, type SectionProps } from '@/modules/shared/presentation/ui';
import { ArrowUpRight, ExternalLink, PackageSearch, Search, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
const stores = [
  {
    name: 'Google Shopping',
    initial: 'G',
    description: 'Explore ofertas de diferentes lojas.',
    color: 'google',
    search: (q: string) => `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(q)}`,
  },
  {
    name: 'Mercado Livre',
    initial: 'M',
    description: 'Encontre vendedores e opções de entrega.',
    color: 'mercado',
    search: (q: string) => `https://lista.mercadolivre.com.br/${encodeURIComponent(q)}`,
  },
  {
    name: 'Amazon',
    initial: 'a',
    description: 'Pesquise produtos para o seu dia a dia.',
    color: 'amazon',
    search: (q: string) => `https://www.amazon.com.br/s?k=${encodeURIComponent(q)}`,
  },
  {
    name: 'Magazine Luiza',
    initial: 'm',
    description: 'Veja alternativas para o seu negócio.',
    color: 'magalu',
    search: (q: string) => `https://www.magazineluiza.com.br/busca/${encodeURIComponent(q)}/`,
  },
];
export function ProcurementPage(props: SectionProps) {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  return (
    <>
      <PageHeading
        eyebrow="ENCONTRE O QUE SEU NEGÓCIO PRECISA"
        title="Um atalho para suas compras"
        description="Comece sua busca aqui e encontre opções nas suas lojas favoritas."
      />
      <section className="procurement-hero">
        <span className="procurement-symbol">
          <PackageSearch size={40} strokeWidth={1.2} />
        </span>
        <h2>O que está na sua lista hoje?</h2>
        <p>Mais praticidade para manter seus cuidados em movimento.</p>
        <form
          className="procurement-search"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(query.trim());
          }}
        >
          <Search size={20} />
          <input
            required
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex.: toalhas, óleos essenciais, material de atendimento…"
            maxLength={150}
          />
          <button className="button primary">Buscar opções</button>
        </form>
        <div className="search-suggestions">
          {['Toalhas de algodão', 'Óleos essenciais', 'Materiais de limpeza'].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => {
                setQuery(suggestion);
                setSubmitted(suggestion);
              }}
            >
              {suggestion}
              <ArrowUpRight size={12} />
            </button>
          ))}
        </div>
      </section>
      <div className="section-title">
        <h2>{submitted ? `Onde buscar “${submitted}”` : 'Suas próximas paradas'}</h2>
        <span>Links para busca nas lojas</span>
      </div>
      <div className="store-grid">
        {stores.map((store) => (
          <article className="panel store-card" key={store.name}>
            <span className={`store-logo ${store.color}`}>{store.initial}</span>
            <h3>{store.name}</h3>
            <p>{store.description}</p>
            <a
              className={`button secondary full ${!submitted ? 'disabled-link' : ''}`}
              href={submitted ? store.search(submitted) : undefined}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!submitted}
            >
              Buscar na loja
              <ExternalLink size={15} />
            </a>
          </article>
        ))}
      </div>
      <div className="info-note">
        <ShoppingBag size={19} />
        <p>
          O Compasso abre a busca na loja escolhida. Preços, disponibilidade, compra e entrega são
          tratados pela própria loja. Esta área não acompanha compras nem controla estoque.
        </p>
      </div>
    </>
  );
}
