'use client';
import { day, money, time } from '@/modules/shared/domain/format';
import type { Order } from '@/modules/shared/domain/models';
import {
  Badge,
  Empty,
  PageHeading,
  ResourceState,
  useResource,
  type SectionProps,
} from '@/modules/shared/presentation/ui';
import { Check, Eye, Package, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { OrderDetails } from './order-details';
const PaymentDialog = dynamic(() => import('./payment-dialog'), { ssr: false });
export function OrdersPage(props: SectionProps) {
  const [paymentRevision, setPaymentRevision] = useState(0);
  const resource = useResource<Order[]>('orders', props.revision + paymentRevision);
  const admin = props.data.user.role === 'admin';
  const details = (order: Order) => props.openDialog({ title: `Pedido #${order.id.slice(0, 8).toUpperCase()}`, content: <OrderDetails order={order} /> });
  const change = (orderId: string, body: unknown, message: string) =>
    props
      .mutate(`orders/${orderId}`, 'PATCH', body, message)
      .catch((e) => props.notify(e.message, true));
  return (
    <>
      <PageHeading
        eyebrow="TUDO O QUE FOI COMBINADO"
        title={admin ? 'Pedidos e vendas' : 'Meus pedidos'}
        description={
          admin
            ? 'Acompanhe cada compra, da chegada à conclusão.'
            : 'Seus produtos, serviços, valores e próximos passos.'
        }
      />
      <ResourceState {...resource} />
      <div className="orders-list">
        {resource.value?.map((order) => (
          <article className="panel order-card" key={order.id}>
            <div className="order-header">
              <span className="order-symbol">
                <ShoppingBag size={21} />
              </span>
              <div>
                <h3>
                  {admin ? order.customerName : <button type="button" className="order-title-button" onClick={() => details(order)} aria-label={`Ver detalhes do pedido #${order.id.slice(0, 8).toUpperCase()}`}>Pedido #{order.id.slice(0, 8).toUpperCase()}</button>}
                </h3>
                <small>
                  {day(order.createdAt)} • {time(order.createdAt)}
                  {admin && !order.seen && <span className="new-label">NOVO</span>}
                </small>
              </div>
              {admin && <Badge status={order.status} />}
              <Badge status={order.paymentStatus}>{order.paymentStatus === 'paid' ? 'Pagamento confirmado' : 'Pagamento pendente'}</Badge>
            </div>
            <div className="order-lines">
              {order.items.map((item, index) => (
                <div className="order-line" key={`${item.itemId}-${index}`}>
                  <span>{item.quantity}×</span>
                  <div>
                    <strong>{item.name}</strong>
                    <small>
                      {item.kind === 'product'
                        ? 'Produto'
                        : `Serviço • ${item.startsAt ? `${day(item.startsAt)} às ${time(item.startsAt)}` : 'Consulte a agenda'}`}
                    </small>
                  </div>
                  <strong>{money(item.unitPriceCents * item.quantity)}</strong>
                </div>
              ))}
            </div>
            {order.address && (
              <p className="order-address">
                <Package size={14} />
                {order.address.street}, {order.address.number} • {order.address.city} •{' '}
                {order.address.postalCode}
              </p>
            )}
            <div className="order-footer">
              {!admin && <button type="button" className="button secondary small" onClick={() => details(order)}>Ver detalhes</button>}
              <div>
                {order.discountCents > 0 && (
                  <small>Você economizou {money(order.discountCents)}</small>
                )}
                <span>
                  Total <strong>{money(order.totalCents)}</strong>
                </span>
              </div>
              {!admin &&
                order.paymentStatus !== 'paid' &&
                order.status !== 'cancelled' &&
                order.paymentMethod === 'pix_manual' && (
                  <div>
                    <strong>Pix direto ao comerciante</strong>
                    <p>Chave: {order.pixKey}</p>
                    <p>
                      Valor: {money(order.totalCents)}. Aguarde a aprovação de eventual triagem
                      antes de pagar. O comerciante confirma o recebimento.
                    </p>
                    <button
                      className="button secondary small"
                      onClick={() =>
                        navigator.clipboard
                          .writeText(order.pixKey || '')
                          .then(() => props.notify('Chave Pix copiada.'))
                          .catch(() => props.notify('Selecione a chave e copie manualmente.', true))
                      }
                    >
                      Copiar chave Pix
                    </button>
                  </div>
                )}
              {!admin &&
                order.paymentStatus !== 'paid' &&
                order.status !== 'cancelled' &&
                order.paymentMethod === 'online' && (
                  <button
                    className="button primary small"
                    onClick={() => props.openDialog({
                      title: 'Finalizar pagamento',
                      description: 'Seu próximo passo, com tranquilidade.',
                      content: ({ setBusy }) => <PaymentDialog order={order} setBusy={setBusy} onPaid={() => {
                        setPaymentRevision(value => value + 1);
                        props.notify('Pagamento confirmado. Seu pedido foi atualizado.');
                      }} />,
                    })}
                  >
                    Pagar agora
                  </button>
                )}
              {admin && (
                <div className="row-actions">
                  {!order.seen && (
                    <button
                      className="button secondary small"
                      onClick={() => change(order.id, { seen: true }, 'Pedido marcado como visto.')}
                    >
                      <Eye size={15} />
                      Marcar visto
                    </button>
                  )}
                  {order.paymentStatus !== 'paid' && order.paymentMethod !== 'online' && (
                    <button
                      className="button secondary small"
                      onClick={() =>
                        change(
                          order.id,
                          { paymentStatus: 'paid' },
                          'Pagamento do pedido registrado.',
                        )
                      }
                    >
                      <Check size={15} />
                      Marcar como pago
                    </button>
                  )}
                  {order.status === 'pending' && (
                    <button
                      className="button primary small"
                      onClick={() =>
                        change(
                          order.id,
                          { status: 'completed' },
                          'Pedido concluído. Os atendimentos continuam com status próprio na agenda.',
                        )
                      }
                    >
                      Concluir pedido
                    </button>
                  )}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
      {!resource.loading && !resource.value?.length && (
        <section className="panel">
          <Empty
            title="Seu próximo pedido começa com uma escolha"
            description="Conheça o catálogo e encontre algo para você."
            action={
              <button className="button primary" onClick={() => props.navigate('catalog')}>
                Explorar catálogo
              </button>
            }
          />
        </section>
      )}
    </>
  );
}
