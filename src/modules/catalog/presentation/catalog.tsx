'use client';
import { money } from '@/modules/shared/domain/format';
import type { CartLine, CatalogItem } from '@/modules/shared/domain/models';
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
  const items = props.data.catalog.filter(
    (item) =>
      (filter === 'all' || item.kind === filter) &&
      `${item.name} ${item.category}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
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
          <article className={`catalog-card ${!item.active ? 'inactive' : ''}`} key={item.id}>
            <div className={`catalog-art art-${index % 5}`}>
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
                    onClick={() => {
                      if (item.kind === 'service' || item.requiresTriage) {
                        props.openDialog({
                          title:
                            item.kind === 'service'
                              ? 'Adicionar serviço à sacola'
                              : 'Adicionar produto com triagem',
                          description: item.name,
                          content: (
                            <div className="form-grid">
                              <>
                                {item.kind === 'service' && (
                                  <Field label="Data e horário">
                                    <input name="startsAt" type="datetime-local" required />
                                  </Field>
                                )}
                              </>
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
                                A disponibilidade será conferida ao finalizar o pedido. Horário de
                                Brasília.
                              </p>
                            </div>
                          ),
                          submitLabel: 'Adicionar à sacola',
                          onSubmit: async (form) => {
                            props.addToCart({
                              itemId: item.id,
                              quantity: 1,
                              startsAt:
                                item.kind === 'service'
                                  ? new Date(`${text(form, 'startsAt')}:00-03:00`).toISOString()
                                  : '',
                              notes: text(form, 'notes'),
                            });
                          },
                        });
                      } else
                        props.addToCart({ itemId: item.id, quantity: 1, startsAt: '', notes: '' });
                    }}
                  >
                    <Plus size={15} />
                    {item.kind === 'service' ? 'Escolher' : 'Adicionar'}
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
      {!items.length && (
        <Empty
          title="Nenhum item encontrado"
          description="Tente outro termo ou cadastre uma nova oferta."
        />
      )}
    </>
  );
}
