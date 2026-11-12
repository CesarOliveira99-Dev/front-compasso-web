'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
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
  const [region, setRegion] = useState<{ city: string; state: string }>();
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');
  const locationRequest = useRef(0);
  const [query, setQuery] = useState(''),
    [page, setPage] = useState(0),
    [result, setResult] = useState<{ items: StoreSummary[]; hasMore: boolean }>(),
    [error, setError] = useState('');
  function clearRegion() {
    locationRequest.current++;
    setLocating(false); setRegion(undefined); setPage(0); setLocationMessage('');
    try { sessionStorage.setItem('compasso:discovery-region', 'all'); } catch {}
  }
  async function locate() {
    if (!navigator.geolocation) { setLocationMessage('Seu navegador não disponibilizou a localização. Busque pelo nome da cidade.'); return; }
    const request = ++locationRequest.current;
    setLocating(true); setLocationMessage('');
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }));
      if (request !== locationRequest.current) return;
      const value = await api<{ city: string; state: string }>('location/nearby', 'POST', { latitude: position.coords.latitude, longitude: position.coords.longitude });
      if (request !== locationRequest.current) return;
      setRegion(value); setQuery(''); setPage(0);
      try { sessionStorage.setItem('compasso:discovery-region', JSON.stringify(value)); } catch {}
    } catch {
      if (request === locationRequest.current) setLocationMessage('Não conseguimos usar sua localização. Você pode buscar pelo nome da cidade.');
    } finally { if (request === locationRequest.current) setLocating(false); }
  }
  useEffect(() => {
    let active = true;
    const initialRequest = locationRequest.current;
    let globalSearch = false;
    try {
      const saved = sessionStorage.getItem('compasso:discovery-region'); globalSearch = saved === 'all';
      if (saved && !globalSearch) {
        const value = JSON.parse(saved);
        if (typeof value.city === 'string' && value.city.length <= 100 && /^[A-Z]{2}$/.test(value.state)) setRegion(value);
      }
    } catch {}
    api<{ enabled: boolean }>('location/nearby').then(async config => {
      if (!active) return;
      setLocationEnabled(config.enabled);
      if (!config.enabled || globalSearch || !navigator.permissions) return;
      try { const permission = await navigator.permissions.query({ name: 'geolocation' });
        if (active && permission.state === 'granted' && locationRequest.current === initialRequest) void locate();
      } catch { /* Browsers without Permissions API keep the explicit location button. */ }
    }).catch(() => {});
    return () => { active = false; locationRequest.current++; };
  }, []);
  useEffect(() => {
    let active = true;
    setResult(undefined);
    setError('');
    const timer = setTimeout(() => {
      api<{ items: StoreSummary[]; hasMore: boolean }>(
        `auth/discovery?q=${encodeURIComponent(query)}&page=${page}${region ? `&city=${encodeURIComponent(region.city)}&state=${region.state}` : ''}`,
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
  }, [query, page, region]);
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
            clearRegion();
            setQuery(event.target.value);
            setPage(0);
          }}
        />
      </Field>
      <div className="discovery-location-controls">
        {locationEnabled && <button type="button" className="button secondary" disabled={locating} onClick={locate}><MapPin size={16} />{locating ? 'Identificando região…' : 'Usar minha localização'}</button>}
        {region && <><span role="status">Estabelecimentos em <strong>{region.city} — {region.state}</strong></span><button type="button" className="text-button" onClick={clearRegion}>Buscar em qualquer lugar</button></>}
        <small>Busque qualquer cidade. Ao usar sua localização, as coordenadas aproximadas são enviadas ao Google para identificar sua cidade; elas não são salvas pelo Compasso.</small>
        {locationMessage && <p role="status">{locationMessage}</p>}
      </div>
      {beforeResults}
      <div className="discovery-results-heading">
        <h2>{region ? 'Na sua região' : 'Estabelecimentos para conhecer'}</h2>
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
        <p>Nenhum estabelecimento encontrado{region ? ` em ${region.city}` : ''}. Tente outro nome ou cidade.{region && <button type="button" className="text-button" onClick={clearRegion}>Ver estabelecimentos de outras regiões</button>}</p>
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
