'use client';
import { day, inputToIso, localInput } from '@/modules/shared/domain/format';
import type { Discount } from '@/modules/shared/domain/models';
import {
  AddButton,
  Badge,
  Empty,
  Field,
  PageHeading,
  ResourceState,
  number,
  text,
  useResource,
  type SectionProps,
} from '@/modules/shared/presentation/ui';
import { CalendarDays, Gift, Percent, Ticket, Users } from 'lucide-react';
import { useState } from 'react';
export function PromotionsPage(props: SectionProps) {
  const [kind, setKind] = useState('coupons');
  const resource = useResource<Discount[]>(`discounts/${kind}`, props.revision);
  function create() {
    const expires = new Date(Date.now() + 7 * 86400000);
    props.openDialog({
      title: kind === 'coupons' ? 'Um cupom com a sua cara' : 'Uma nova campanha',
      description:
        kind === 'coupons'
          ? 'Crie motivos para seus clientes voltarem.'
          : 'Descontos aparecem diretamente no catálogo, sem precisar de código.',
      submitLabel: kind === 'coupons' ? 'Criar cupom' : 'Criar promoção',
      content: (
        <div className="form-grid">
          <Field label="Nome da campanha">
            <input
              name="name"
              required
              minLength={2}
              maxLength={100}
              placeholder="Ex.: Um cuidado especial"
            />
          </Field>
          {kind === 'coupons' && (
            <Field label="Código do cupom">
              <input
                name="code"
                required
                maxLength={40}
                placeholder="VOLTESEMPRE"
                style={{ textTransform: 'uppercase' }}
              />
            </Field>
          )}
          <div className="form-row">
            <Field label="Desconto (%)">
              <input name="percent" type="number" required min={1} max={100} defaultValue={10} />
            </Field>
            <Field label="Limite de pessoas" hint="0 = sem limite. Um uso por cliente para cupons.">
              <input name="maxUses" type="number" min={0} max={1000000} defaultValue={0} />
            </Field>
          </div>
          <div className="form-row">
            <Field label="Início">
              <input name="startsAt" type="datetime-local" required defaultValue={localInput()} />
            </Field>
            <Field label="Fim da validade">
              <input
                name="expiresAt"
                type="datetime-local"
                required
                defaultValue={localInput(expires.toISOString())}
              />
            </Field>
          </div>
          <Field label="Aplicar a">
            <select name="kind">
              <option value="">Produtos e serviços</option>
              <option value="service">Somente serviços</option>
              <option value="product">Somente produtos</option>
            </select>
          </Field>
          <Field
            label="Itens específicos"
            hint="Sem seleção = todos os itens do tipo escolhido. Segure Ctrl para selecionar mais de um."
          >
            <select name="itemIds" multiple size={4}>
              {props.data.catalog.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Dias da semana"
            hint="Sem seleção = todos os dias. Para serviços, vale o dia agendado."
          >
            <div className="weekday-options">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((label, index) => (
                <label key={label}>
                  <input type="checkbox" name="weekdays" value={index} />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </Field>
          <p className="form-note">
            Promoções e cupons não acumulam: vale o maior percentual aplicável. Não alteram pedidos
            já confirmados.
          </p>
        </div>
      ),
      onSubmit: async (form) => {
        await props.mutate(
          `discounts/${kind}`,
          'POST',
          {
            name: text(form, 'name'),
            code: text(form, 'code') || undefined,
            percent: number(form, 'percent'),
            maxUses: kind === 'coupons' ? number(form, 'maxUses') : 0,
            startsAt: inputToIso(text(form, 'startsAt')),
            expiresAt: inputToIso(text(form, 'expiresAt')),
            kinds: text(form, 'kind') ? [text(form, 'kind')] : [],
            itemIds: form.getAll('itemIds').map(String),
            weekdays: form.getAll('weekdays').map(Number),
            active: true,
          },
          kind === 'coupons' ? 'Cupom criado.' : 'Promoção criada e publicada no catálogo.',
        );
      },
    });
  }
  return (
    <>
      <PageHeading
        eyebrow="UM CONVITE PARA VOLTAR"
        title="Cupons e promoções"
        description="Dê seu toque a cada oferta, em qualquer época do ano."
        action={
          <AddButton onClick={create}>
            {kind === 'coupons' ? 'Novo cupom' : 'Nova promoção'}
          </AddButton>
        }
      />
      <div className="toolbar">
        <div className="tabs">
          <button className={kind === 'coupons' ? 'active' : ''} onClick={() => setKind('coupons')}>
            <Ticket size={15} />
            Cupons personalizados
          </button>
          <button
            className={kind === 'promotions' ? 'active' : ''}
            onClick={() => setKind('promotions')}
          >
            <Percent size={15} />
            Promoções / Black Friday
          </button>
        </div>
      </div>
      <ResourceState {...resource} />
      <div className="discount-grid">
        {resource.value?.map((discount) => (
          <article className="panel discount-card" key={discount.id}>
            <div className="discount-top">
              <span>
                {discount.percent}
                <small>% OFF</small>
              </span>
              <Badge status={discount.active ? 'active' : 'cancelled'}>
                {discount.active ? 'Ativo' : 'Pausado'}
              </Badge>
            </div>
            <h3>{discount.name}</h3>
            {discount.code && <code className="coupon-code">{discount.code}</code>}
            <p>
              <CalendarDays size={14} />
              {day(discount.startsAt)} até {day(discount.expiresAt)}
            </p>
            <p>
              <Users size={14} />
              {discount.uses} uso(s)
              {discount.maxUses > 0 ? ` de ${discount.maxUses}` : ' • sem limite'}
            </p>
            <p>
              <Gift size={14} />
              {discount.itemIds.length
                ? `${discount.itemIds.length} item(ns) selecionado(s)`
                : discount.kinds.length
                  ? 'Por tipo de oferta'
                  : 'Todo o catálogo'}
            </p>
            <button
              className="button secondary full"
              onClick={() =>
                props
                  .mutate(
                    `discounts/${kind}/${discount.id}`,
                    'PATCH',
                    { active: !discount.active },
                    discount.active ? 'Campanha pausada.' : 'Campanha ativada.',
                  )
                  .catch((e) => props.notify(e.message, true))
              }
            >
              {discount.active ? 'Pausar campanha' : 'Ativar campanha'}
            </button>
          </article>
        ))}
      </div>
      {!resource.loading && !resource.value?.length && (
        <Empty
          title="Sua próxima boa ideia pode começar aqui"
          description="Crie uma campanha para uma data especial ou um cupom para encantar seus clientes."
        />
      )}
    </>
  );
}
