'use client';
import { useEffect, useState } from 'react';
import { Check, LoaderCircle, MapPin, ShoppingBag, Trash2 } from 'lucide-react';
import type { CartLine, Customer, Order } from '@/modules/shared/domain/models';
import { day, money, time } from '@/modules/shared/domain/format';
import { api } from '@/modules/shared/infrastructure/api';
import {
  Empty,
  Field,
  PageHeading,
  ResourceState,
  useResource,
  type SectionProps,
} from '@/modules/shared/presentation/ui';
interface Quote {
  totalCents: number;
  discountCents: number;
}
export function CartPage(
  props: SectionProps & { cart: CartLine[]; setCart: (cart: CartLine[]) => void },
) {
  const resource = useResource<Customer>('customers/profile', props.revision);
  const [coupon, setCoupon] = useState('');
  const [addressId, setAddressId] = useState('');
  const [busy, setBusy] = useState(false);
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [quote, setQuote] = useState<Quote>();
  const [quoteError, setQuoteError] = useState('');
  const lines = props.cart
    .map((line, index) => ({
      ...line,
      index,
      item: props.data.catalog.find((i) => i.id === line.itemId),
    }))
    .filter((line) => line.item);
  const hasProduct = lines.some((line) => line.item?.kind === 'product');
  const selectedAddressId = addressId || resource.value?.addresses.find((a) => a.isDefault)?.id;
  const input = JSON.stringify({
    items: props.cart.map((line) => ({ ...line, startsAt: line.startsAt || undefined })),
    coupon: coupon.trim() || undefined,
    paymentMethod: 'on_day',
    addressId: selectedAddressId,
    idempotencyKey,
  });
  useEffect(() => {
    let current = true;
    setQuote(undefined);
    setQuoteError('');
    if (!lines.length || (hasProduct && !selectedAddressId)) return;
    const timer = setTimeout(() => {
      api<Quote>('orders/quote', 'POST', JSON.parse(input))
        .then((value) => {
          if (current) setQuote(value);
        })
        .catch((error) => {
          if (current) setQuoteError(error.message);
        });
    }, 350);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [input, lines.length, hasProduct, selectedAddressId, props.revision]);
  async function checkout() {
    setBusy(true);
    try {
      await props.mutate<Order>(
        'orders',
        'POST',
        { ...JSON.parse(input), expectedTotalCents: quote?.totalCents },
        'Pedido confirmado! Consulte os detalhes em Meus pedidos.',
      );
      props.setCart([]);
      props.navigate('orders');
    } catch (error) {
      props.notify(error instanceof Error ? error.message : 'Não foi possível confirmar.', true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="ESCOLHAS QUE FAZEM BEM"
        title="Sua sacola"
        description="Confira cada detalhe antes de confirmar seu próximo cuidado."
      />
      {!lines.length ? (
        <section className="panel">
          <Empty
            title="Espaço para algo especial"
            description="Escolha produtos e serviços no catálogo para começar."
            action={
              <button className="button primary" onClick={() => props.navigate('catalog')}>
                Explorar catálogo
              </button>
            }
          />
        </section>
      ) : (
        <div className="cart-layout">
          <section className="panel cart-items">
            <div className="panel-heading">
              <h2>Seus cuidados escolhidos</h2>
              <span>{lines.length} item(ns)</span>
            </div>
            {lines.map((line) => (
              <div className="cart-line" key={line.index}>
                <span className="order-symbol">
                  <ShoppingBag size={22} />
                </span>
                <div>
                  <strong>{line.item!.name}</strong>
                  <small>
                    {line.startsAt
                      ? `${day(line.startsAt)} às ${time(line.startsAt)} • ${line.item!.durationMinutes} min`
                      : 'Produto • entregue no seu endereço'}
                  </small>
                  {line.item!.requiresTriage && (
                    <small className="triage-label">Sujeito à aprovação da triagem</small>
                  )}
                </div>
                {line.item!.kind === 'product' && (
                  <input
                    className="quantity-input"
                    aria-label={`Quantidade de ${line.item!.name}`}
                    type="number"
                    min={1}
                    max={50}
                    value={line.quantity}
                    onChange={(event) => {
                      const next = [...props.cart];
                      next[line.index] = {
                        ...next[line.index],
                        quantity: Math.max(1, Math.min(50, Number(event.target.value) || 1)),
                      };
                      props.setCart(next);
                    }}
                  />
                )}
                <strong>{money(line.item!.currentPriceCents * line.quantity)}</strong>
                <button
                  className="icon-button"
                  aria-label={`Remover ${line.item!.name}`}
                  onClick={() =>
                    props.setCart(props.cart.filter((_, index) => index !== line.index))
                  }
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
            {hasProduct && (
              <div className="checkout-address">
                <h3>
                  <MapPin size={18} />
                  Onde vamos entregar?
                </h3>
                <ResourceState {...resource} />
                {resource.value?.addresses.length ? (
                  <Field label="Endereço de entrega">
                    <select
                      value={selectedAddressId || ''}
                      onChange={(event) => setAddressId(event.target.value)}
                    >
                      {resource.value.addresses.map((address) => (
                        <option key={address.id} value={address.id}>
                          {address.label}: {address.street}, {address.number} • {address.city}
                        </option>
                      ))}
                    </select>
                  </Field>
                ) : (
                  <p>Cadastre seu endereço em Meus dados para continuar.</p>
                )}
                <button className="text-button" onClick={() => props.navigate('profile')}>
                  Cadastrar ou alterar endereços
                </button>
              </div>
            )}
          </section>
          <aside className="panel checkout-summary">
            <h2>Resumo do pedido</h2>
            <Field label="Tem um cupom?">
              <input
                value={coupon}
                maxLength={40}
                onChange={(event) => setCoupon(event.target.value.toUpperCase())}
                placeholder="Seu código especial"
              />
            </Field>
            {quoteError && (
              <p className="error-message" role="alert">
                {quoteError}
              </p>
            )}
            {!quote && !quoteError && (!hasProduct || selectedAddressId) && (
              <p className="form-note">
                <LoaderCircle className="spin" size={13} /> Validando valores…
              </p>
            )}
            {quote && (
              <>
                <div className="checkout-total-row">
                  <span>Valor original</span>
                  <strong>{money(quote.totalCents + quote.discountCents)}</strong>
                </div>
                {quote.discountCents > 0 && (
                  <div className="checkout-total-row">
                    <span>Descontos</span>
                    <strong>− {money(quote.discountCents)}</strong>
                  </div>
                )}
              </>
            )}
            <p className="form-note">
              Cupons e promoções não acumulam. Aplicamos o maior desconto válido para cada item e
              dia.
            </p>
            <div className="checkout-payment">
              <Check size={18} />
              <div>
                <strong>Pagamento no dia</strong>
                <small>Serviços no atendimento • produtos na entrega</small>
              </div>
            </div>
            <div className="checkout-total-row final">
              <span>Total</span>
              <strong>{quote ? money(quote.totalCents) : '—'}</strong>
            </div>
            <button
              className="button primary full"
              disabled={busy || !quote || (hasProduct && !selectedAddressId)}
              onClick={checkout}
            >
              {busy ? 'Confirmando…' : 'Confirmar meu pedido'}
            </button>
            <p className="form-note centered">
              Valores e horários são revalidados na confirmação. Nenhum valor será cobrado pela
              plataforma.
            </p>
          </aside>
        </div>
      )}
    </>
  );
}
