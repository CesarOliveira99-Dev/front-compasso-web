'use client';
import { Brand } from '@/modules/shared/presentation/brand';
import './public-store.css';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  ChevronRight,
  Clock3,
  Leaf,
  MapPin,
  Package,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react';
import { api } from '@/modules/shared/infrastructure/api';
import { money } from '@/modules/shared/domain/format';
import { PublicStoreGallery } from './public-store-gallery';
import { VenueDetails, VenueReviews, VenueTeam } from './public-store-details';
import type { PublicStoreData } from './public-store.models';

type CatalogEntry = PublicStoreData['catalog'][number];
const sections = [
  { id: 'servicos', label: 'Serviços e produtos' },
  { id: 'avaliacoes', label: 'Avaliações' },
  { id: 'equipe', label: 'Equipe' },
  { id: 'sobre', label: 'Sobre e horários' },
];
export function PublicStore() {
  const [data, setData] = useState<PublicStoreData>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const [active, setActive] = useState('servicos');
  const [shared, setShared] = useState('');
  useEffect(() => {
    const slug = new URLSearchParams(location.search).get('slug');
    if (!slug) {
      setError('Estabelecimento não encontrado.');
      return;
    }
    let active = true;
    api<PublicStoreData>(`auth/store/${encodeURIComponent(slug)}`)
      .then((value) => {
        if (active) setData(value);
      })
      .catch((error) => {
        if (active) setError(error.message);
      });
    return () => {
      active = false;
    };
  }, []);
  async function book() {
    if (!data) return;
    setBusy(true);
    setError('');
    try {
      try {
        await api('auth/me');
      } catch (error) {
        if (error instanceof Error && /Entre para continuar/.test(error.message)) {
          location.assign(`/?loja=${encodeURIComponent(data.store.slug)}`);
          return;
        }
        throw error;
      }
      await api('auth/switch-store', 'POST', { slug: data.store.slug });
      location.assign('/?agendar=1');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Não foi possível continuar.');
      setBusy(false);
    }
  }
  async function share() {
    try {
      await navigator.clipboard.writeText(location.href);
      setShared('Link copiado!');
    } catch {
      setShared('Copie o endereço da loja na barra do navegador.');
    }
  }
  if (!data)
    return (
      <main className="venue-shell">
        <a className="brand" href="/descobrir">
          <Brand />
        </a>
        <div className="venue-card venue-loading" role={error ? 'alert' : 'status'}>
          <Leaf size={32} />
          <h1>
            {error ? 'Não foi possível abrir este espaço' : 'Preparando seu próximo cuidado…'}
          </h1>
          <p>{error || 'Estamos reunindo os detalhes do estabelecimento.'}</p>
          <a className="venue-text-link" href="/descobrir">
            <ArrowLeft size={16} /> Voltar à descoberta
          </a>
        </div>
      </main>
    );
  const { store, catalog, reputation } = data;
  const categories = ['Todos', ...new Set(catalog.map((item) => item.category))];
  const normalize = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  const filtered = catalog.filter(
    (item) =>
      (category === 'Todos' || item.category === category) &&
      normalize(`${item.name} ${item.description} ${item.category}`).includes(normalize(search)),
  );
  const groups = [...new Set(filtered.map((item) => item.category))];
  const services = catalog.filter((item) => item.kind === 'service');
  const startingPrice = services.length
    ? Math.min(...services.map((item) => item.currentPriceCents))
    : undefined;
  const popular = services
    .filter((item) => (item.popularityCount || 0) > 0)
    .sort((a, b) => (b.popularityCount || 0) - (a.popularityCount || 0))
    .slice(0, 3);
  function serviceRow(item: CatalogEntry) {
    const cover = item.media?.find((asset) => asset.type === 'image');
    return (
      <article className="venue-service" key={item.id}>
        <div className={`venue-service-art ${item.kind === 'product' ? 'is-product' : ''}`}>
          {cover ? (
            <img src={cover.url} alt={cover.alt || item.name} loading="lazy" />
          ) : item.kind === 'service' ? (
            <Leaf size={24} strokeWidth={1.4} />
          ) : (
            <Package size={24} strokeWidth={1.4} />
          )}
        </div>
        <div className="venue-service-info">
          <h4>{item.name}</h4>
          <p>{item.description}</p>
          <span className="venue-service-meta">
            {item.kind === 'service' ? (
              <>
                <Clock3 size={13} />
                {item.durationMinutes} min
              </>
            ) : (
              <>
                <Package size={13} />
                Produto
              </>
            )}
            {item.percentOff > 0 && <em>{item.percentOff}% de desconto</em>}
          </span>
        </div>
        <div className="venue-service-action">
          {item.percentOff > 0 && <del>{money(item.priceCents)}</del>}
          <strong>{money(item.currentPriceCents)}</strong>
          <button className="venue-book-small" disabled={busy} onClick={book}>
            {item.kind === 'service' ? 'Agendar' : 'Escolher'}
            <ChevronRight size={14} />
          </button>
        </div>
      </article>
    );
  }
  return (
    <div className="venue-page">
      <header className="venue-topbar">
        <div className="venue-shell">
          <a className="brand" href="/">
            <Brand />
          </a>
          <a className="venue-back" href="/descobrir">
            <ArrowLeft size={16} /> Explorar estabelecimentos
          </a>
          <span className="venue-top-note">
            <Leaf size={15} /> Seu cuidado começa aqui
          </span>
        </div>
      </header>
      <main className="venue-shell">
        <div className="venue-breadcrumb">
          <a href="/descobrir">Descobrir</a>
          <ChevronRight size={12} />
          {store.address && (
            <>
              <span>{store.address.city}</span>
              <ChevronRight size={12} />
            </>
          )}
          <span>{store.businessName}</span>
        </div>
        <PublicStoreGallery assets={store.media || []} name={store.businessName} />
        <section className="venue-identity">
          <div>
            <span className="venue-kicker">BEM-VINDO AO SEU PRÓXIMO CUIDADO</span>
            <h1>{store.businessName}</h1>
            <div className="venue-identity-meta">
              <a href="#avaliacoes" className="venue-rating">
                <Star size={16} fill="currentColor" />
                <strong>
                  {reputation.summary.count
                    ? reputation.summary.average.toFixed(1).replace('.', ',')
                    : 'Novo'}
                </strong>
                <span>
                  {reputation.summary.count
                    ? `${reputation.summary.count} ${reputation.summary.count === 1 ? 'avaliação verificada' : 'avaliações verificadas'}`
                    : 'Conheça este espaço'}
                </span>
              </a>
              {store.address && (
                <span>
                  <MapPin size={15} />
                  {store.address.district} · {store.address.city}/{store.address.state}
                </span>
              )}
            </div>
          </div>
          <div className="venue-identity-actions">
            <button
              className="venue-share"
              aria-label="Compartilhar estabelecimento"
              onClick={share}
            >
              <Share2 size={16} />
              <span>Compartilhar</span>
            </button>
            <span className="venue-share-status" role="status">
              {shared}
            </span>
          </div>
        </section>
        <nav className="venue-section-nav" aria-label="Seções do estabelecimento">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={active === section.id ? 'active' : ''}
              onClick={() => setActive(section.id)}
            >
              {section.label}
              {section.id === 'servicos' && <span>{catalog.length}</span>}
            </a>
          ))}
        </nav>
        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}
        <div className="venue-layout">
          <div className="venue-content">
            {popular.length > 0 && !search && category === 'Todos' && (
              <section className="venue-popular">
                <div className="venue-section-heading">
                  <div>
                    <span className="venue-kicker">
                      <Sparkles size={13} /> OS FAVORITOS DA ROTINA
                    </span>
                    <h2>Mais procurados</h2>
                  </div>
                  <span className="venue-caption">Por quem já veio</span>
                </div>
                <div className="venue-popular-grid">
                  {popular.map((item) => (
                    <button
                      className="venue-popular-item"
                      key={item.id}
                      onClick={book}
                      disabled={busy}
                    >
                      <span className="venue-popular-mark">
                        <Leaf size={18} />
                      </span>
                      <strong>{item.name}</strong>
                      <small>
                        <Clock3 size={12} />
                        {item.durationMinutes} min
                      </small>
                      <span>
                        {money(item.currentPriceCents)}
                        <ArrowUpRight size={17} />
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}
            <section className="venue-card venue-section venue-services" id="servicos">
              <div className="venue-section-heading">
                <div>
                  <span className="venue-kicker">UM TEMPO SÓ SEU</span>
                  <h2>Encontre seu próximo cuidado</h2>
                  <p>Escolha com calma. A gente organiza o próximo passo.</p>
                </div>
                <span className="venue-count">{catalog.length} opções</span>
              </div>
              <label className="venue-search">
                <Search size={18} />
                <input
                  type="search"
                  value={search}
                  maxLength={100}
                  placeholder="Buscar serviço ou produto"
                  aria-label="Buscar serviço ou produto"
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <div className="venue-category-tabs" role="group" aria-label="Categorias de serviços">
                {categories.map((value) => (
                  <button
                    key={value}
                    aria-pressed={category === value}
                    onClick={() => setCategory(value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
              {groups.map((group) => (
                <div className="venue-service-group" key={group}>
                  <div className="venue-group-title">
                    <h3>{group}</h3>
                    <span>
                      {filtered.filter((item) => item.category === group).length}{' '}
                      {filtered.filter((item) => item.category === group).length === 1
                        ? 'opção'
                        : 'opções'}
                    </span>
                  </div>
                  {filtered.filter((item) => item.category === group).map(serviceRow)}
                </div>
              ))}
              {!filtered.length && (
                <div className="venue-empty">
                  <Search size={28} />
                  <h3>
                    {catalog.length ? 'Nenhum cuidado encontrado' : 'Novos cuidados vêm por aí'}
                  </h3>
                  <p>
                    {catalog.length
                      ? 'Tente outro nome ou categoria.'
                      : 'O estabelecimento está preparando seu catálogo. Conheça a equipe e os horários abaixo.'}
                  </p>
                  {catalog.length > 0 && (
                    <button
                      className="venue-text-link"
                      onClick={() => {
                        setSearch('');
                        setCategory('Todos');
                      }}
                    >
                      Limpar busca e filtros
                    </button>
                  )}
                </div>
              )}
            </section>
            <VenueReviews data={data} />
            <VenueTeam data={data} />
          </div>
          <aside className="venue-sidebar">
            <section className="venue-card venue-reservation">
              <span className="venue-kicker">SEU PRÓXIMO MOMENTO</span>
              <h2>
                Reserve um tempo
                <br />
                para você.
              </h2>
              <p>Escolha o cuidado, o profissional e o melhor horário na sua agenda.</p>
              {startingPrice !== undefined && (
                <div className="venue-from-price">
                  <span>Serviços a partir de</span>
                  <strong>{money(startingPrice)}</strong>
                </div>
              )}
              <a className="venue-primary" href="#servicos">
                <CalendarDays size={17} /> Ver serviços e agendar
                <ArrowUpRight size={17} />
              </a>
              <span className="venue-reassurance">
                <ShieldCheck size={14} /> Você revisa tudo antes de confirmar.
              </span>
            </section>
            <VenueDetails data={data} />
          </aside>
        </div>
        <footer className="venue-footer">
          <a className="brand" href="/">
            <Brand />
          </a>
          <p>Cada cuidado começa com uma boa conexão.</p>
          <a href="/descobrir">
            Encontre outros espaços <ArrowUpRight size={14} />
          </a>
        </footer>
      </main>
      <div className="venue-mobile-reserve">
        <div>
          <small>
            {startingPrice !== undefined ? 'Serviços a partir de' : 'SEU PRÓXIMO CUIDADO'}
          </small>
          <strong>{startingPrice !== undefined ? money(startingPrice) : store.businessName}</strong>
        </div>
        <a href="#servicos">
          Ver serviços <ArrowUpRight size={17} />
        </a>
      </div>
    </div>
  );
}
