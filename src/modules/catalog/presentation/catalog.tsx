'use client';
import { StoreReviews } from '@/modules/feedback/presentation/reputation';
import {
  MediaEditor,
  MediaGallery,
  mediaFromForm,
} from '@/modules/shared/presentation/media-editor';
import { Storefront } from '@/modules/stores/presentation/storefront';
import { money } from '@/modules/shared/domain/format';
import type { CartLine, CatalogItem } from '@/modules/shared/domain/models';
import { openBooking } from '@/modules/appointments/presentation/booking-dialog';
import {
  AddButton,
  Empty,
  Field,
  PageHeading,
  number,
  text,
  type SectionProps,
} from '@/modules/shared/presentation/ui';
import { Clock3, Flower2, Leaf, Package, Plus, Search, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
export function CatalogPage(props: SectionProps & { addToCart: (line: CartLine) => void }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const admin = props.data.user.role === 'admin';
  function edit(item?: CatalogItem) {
    props.openDialog({
      title: item ? 'Editar cuidado' : 'Um novo cuidado',
      description: 'Cadastre o que seu negócio oferece, do seu jeito.',
      content: (
        <div className="form-grid">
          <Field label="Nome">
            <input
              name="name"
              required
              defaultValue={item?.name}
              minLength={2}
              maxLength={100}
              placeholder="Ex.: Sessão de relaxamento"
            />
          </Field>
          <div className="form-row">
            <Field label="Tipo">
              <select name="kind" defaultValue={item?.kind || 'service'}>
                <option value="service">Serviço / atendimento</option>
                <option value="product">Produto</option>
              </select>
            </Field>
            <Field label="Categoria">
              <input
                name="category"
                required
                defaultValue={item?.category}
                placeholder="Ex.: Bem-estar"
              />
            </Field>
          </div>
          <div className="form-row">
            <Field label="Valor (R$)">
              <input
                name="price"
                type="number"
                step="0.01"
                min="0.01"
                required
                defaultValue={item ? item.priceCents / 100 : undefined}
              />
            </Field>
            <Field label="Duração (minutos)">
              <input
                name="durationMinutes"
                type="number"
                min={0}
                max={720}
                defaultValue={item?.durationMinutes ?? 60}
                required
              />
            </Field>
          </div>
          <Field label="Descrição">
            <textarea
              name="description"
              rows={3}
              maxLength={1000}
              defaultValue={item?.description}
            />
          </Field>
          <MediaEditor initial={item?.media} limit={6} />
          <label className="checkbox-field">
            <input type="checkbox" name="requiresTriage" defaultChecked={item?.requiresTriage} />
            Solicitar triagem antes da confirmação do serviço
          </label>
          <label className="checkbox-field">
            <input type="checkbox" name="active" defaultChecked={item?.active ?? true} />
            Disponível para os clientes
          </label>
        </div>
      ),
      onSubmit: async (form) => {
        await props.mutate(
          item ? `catalog/${item.id}` : 'catalog',
          item ? 'PATCH' : 'POST',
          {
            media: mediaFromForm(form),
            name: text(form, 'name'),
            kind: text(form, 'kind'),
            category: text(form, 'category'),
            priceCents: Math.round(number(form, 'price') * 100),
            durationMinutes: number(form, 'durationMinutes'),
            description: text(form, 'description'),
            requiresTriage: form.has('requiresTriage'),
            active: form.has('active'),
          },
          'Catálogo atualizado.',
        );
      },
    });
  }
  const popular = props.data.catalog
    .filter((item) => item.kind === 'service' && item.active && (item.popularityCount || 0) > 0)
    .sort(
      (a, b) =>
        (b.popularityCount || 0) - (a.popularityCount || 0) ||
        a.name.localeCompare(b.name, 'pt-BR'),
    )
    .slice(0, 3);
  const items = props.data.catalog.filter(
    (item) =>
      (filter === 'all' || item.kind === filter) &&
      `${item.name} ${item.category}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      {!admin && <Storefront {...props} />}
      <PageHeading
        eyebrow={admin ? 'O QUE VOCÊ FAZ DE MELHOR' : 'UM MOMENTO PARA VOCÊ'}
        title={admin ? 'Serviços e produtos' : 'Encontre seu próximo cuidado'}
        description={
          admin
            ? 'Cada oferta, com a personalidade do seu negócio.'
            : 'Escolha com calma. Nós cuidamos do próximo passo.'
        }
        action={admin ? <AddButton onClick={() => edit()}>Novo item</AddButton> : undefined}
      />
      {!!popular.length && filter === 'all' && !search.trim() && (
        <section className="popular-services" aria-label="Serviços mais populares">
          <header>
            <div>
              <span className="eyebrow">OS FAVORITOS DA ROTINA</span>
              <h2>Mais agendados</h2>
            </div>
            <p>Confirmados ou concluídos nos últimos 90 dias.</p>
          </header>
          <div>
            {popular.map((item, index) => (
              <a href={`#catalog-${item.id}`} key={item.id} className="popular-service">
                <span className="popular-position">0{index + 1}</span>
                <div>
                  <h3>{item.name}</h3>
                  <small>
                    {item.popularityCount} agendamentos · {item.durationMinutes} min
                  </small>
                </div>
                <strong>{money(item.currentPriceCents)}</strong>
                <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </section>
      )}
      <div className="toolbar">
        <div className="tabs">
          {[
            ['all', 'Todos'],
            ['service', 'Serviços'],
            ['product', 'Produtos'],
          ].map(([key, name]) => (
            <button
              key={key}
              className={filter === key ? 'active' : ''}
              onClick={() => setFilter(key)}
            >
              {name}
            </button>
          ))}
        </div>
        <label className="search-field">
          <Search size={17} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar no catálogo…"
          />
        </label>
      </div>
      <div className="catalog-grid">
        {items.map((item, index) => (
          <article
            id={`catalog-${item.id}`}
            tabIndex={-1}
            className={`catalog-card ${!item.active ? 'inactive' : ''}`}
            key={item.id}
          >
            <div
              className={`catalog-art art-${index % 5} ${item.media?.length ? 'has-media' : ''}`}
            >
              {!!item.media?.length && <MediaGallery assets={[item.media[0]]} />}
              <span className="catalog-art-shape" />
              {item.kind === 'product' ? (
                <Package size={53} strokeWidth={1} />
              ) : index % 2 ? (
                <Flower2 size={58} strokeWidth={1} />
              ) : (
                <Leaf size={58} strokeWidth={1} />
              )}
              {item.percentOff > 0 && <span className="discount-tag">{item.percentOff}% OFF</span>}
              <span className="catalog-kind">
                {item.kind === 'product' ? 'PRODUTO' : 'SERVIÇO'}
              </span>
            </div>
            <div className="catalog-body">
              <span className="eyebrow">{item.category}</span>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              {!!item.media && item.media.length > 1 && (
                <MediaGallery assets={item.media.slice(1)} />
              )}
              <div className="catalog-meta">
                {item.kind === 'service' ? (
                  <>
                    <Clock3 size={14} />
                    {item.durationMinutes} minutos
                  </>
                ) : (
                  <>
                    <ShoppingBag size={14} />
                    Entrega no seu endereço
                  </>
                )}
                {item.requiresTriage && <span className="triage-label">Com triagem</span>}
              </div>
              <div className="catalog-bottom">
                <div>
                  {item.percentOff > 0 && <del>{money(item.priceCents)}</del>}
                  <strong>{money(item.currentPriceCents)}</strong>
                </div>
                {admin ? (
                  <button className="button secondary small" onClick={() => edit(item)}>
                    Editar
                  </button>
                ) : (
                  <button
                    className="button primary small"
                    onClick={async () => {
                      if (item.kind === 'service') {
                        try {
                          await openBooking(props, item.id);
                        } catch (error) {
                          props.notify(
                            error instanceof Error
                              ? error.message
                              : 'Não foi possível carregar a agenda.',
                            true,
                          );
                        }
                        return;
                      }
                      if (item.requiresTriage) {
                        props.openDialog({
                          title: 'Adicionar produto com triagem',
                          description: item.name,
                          content: (
                            <div className="form-grid">
                              <Field label="Preferências e necessidade para triagem">
                                <textarea
                                  name="notes"
                                  rows={3}
                                  required={item.requiresTriage}
                                  minLength={item.requiresTriage ? 5 : 0}
                                  maxLength={2000}
                                />
                              </Field>
                              <p className="form-note">
                                Produtos com triagem aguardam aprovação da loja.
                              </p>
                            </div>
                          ),
                          submitLabel: 'Adicionar à sacola',
                          onSubmit: async (form) => {
                            props.addToCart({
                              itemId: item.id,
                              quantity: 1,
                              startsAt: '',
                              notes: text(form, 'notes'),
                            });
                          },
                        });
                      } else
                        props.addToCart({ itemId: item.id, quantity: 1, startsAt: '', notes: '' });
                    }}
                  >
                    <Plus size={15} />
                    {item.kind === 'service' ? 'Agendar' : 'Adicionar'}
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
      {!admin && <StoreReviews revision={props.revision} />}
      {!items.length && (
        <Empty
          title="Nenhum item encontrado"
          description="Tente outro termo ou cadastre uma nova oferta."
        />
      )}
    </>
  );
}
