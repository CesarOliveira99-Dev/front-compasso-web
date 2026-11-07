'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { api } from '@/modules/shared/infrastructure/api';
import type { StoreSummary } from '@/modules/shared/domain/models';
import { Field, PageHeading } from '@/modules/shared/presentation/ui';
import { ArrowUpRight, MapPin } from 'lucide-react';
export function Discovery({
  embedded = false,
  beforeResults,
}: {
  embedded?: boolean;
  beforeResults?: ReactNode;
}) {
  const [query, setQuery] = useState(''),
    [page, setPage] = useState(0),
    [result, setResult] = useState<{ items: StoreSummary[]; hasMore: boolean }>(),
    [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setResult(undefined);
    setError('');
    const timer = setTimeout(() => {
      api<{ items: StoreSummary[]; hasMore: boolean }>(
        `auth/discovery?q=${encodeURIComponent(query)}&page=${page}`,
      )
        .then((value) => {
          if (active) setResult(value);
        })
        .catch((error) => {
          if (active) setError(error.message);
        });
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, page]);
  function visit(slug: string) {
    location.assign(`/loja?slug=${encodeURIComponent(slug)}`);
  }
  return (
    <section className="discovery-page">
      {!embedded && (
        <PageHeading
          eyebrow="CUIDADO POR PERTO"
          title="Um bom cuidado começa por aqui."
          description="Encontre estabelecimentos e agende com a mesma conta."
        />
      )}
      <Field label="Buscar estabelecimento ou cidade">
        <input
          value={query}
          maxLength={100}
          placeholder="Nome do estabelecimento ou cidade"
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(0);
          }}
        />
      </Field>
      {beforeResults}
      <div className="discovery-results-heading">
        <h2>Estabelecimentos para conhecer</h2>
        {result && (
          <small aria-live="polite">
            {result.items.length}
            {result.hasMore ? '+' : ''} encontrados
          </small>
        )}
      </div>
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      {!result && !error && <p role="status">Buscando estabelecimentos…</p>}
      <div className="catalog-grid">
        {result?.items.map((store) => (
          <article className="panel discovery-card" key={store.slug}>
            <div className="pulse-store-sign">
              <span>{store.businessName}</span>
            </div>
            <h2>{store.businessName}</h2>
            <p className="pulse-store-location">
              <MapPin size={14} />
              {[store.city, store.state].filter(Boolean).join(' — ') || 'Localização em preparação'}
            </p>
            <button className="button secondary" onClick={() => visit(store.slug)}>
              Ver loja <ArrowUpRight size={16} />
            </button>
          </article>
        ))}
      </div>
      {result && !result.items.length && (
        <p>Nenhum estabelecimento encontrado. Tente outro nome ou cidade.</p>
      )}
      <div className="booking-navigation">
        <button className="button secondary" disabled={!page} onClick={() => setPage(page - 1)}>
          Anterior
        </button>
        <span>Página {page + 1}</span>
        <button
          className="button secondary"
          disabled={!result?.hasMore}
          onClick={() => setPage(page + 1)}
        >
          Mais estabelecimentos
        </button>
      </div>
    </section>
  );
}
