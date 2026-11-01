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
export function OrdersPage(props: SectionProps) {
  const resource = useResource<Order[]>('orders', props.revision);
  const admin = props.data.user.role === 'admin';
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
                  {admin ? order.customerName : `Pedido #${order.id.slice(0, 8).toUpperCase()}`}
                </h3>
                <small>
                  {day(order.createdAt)} • {time(order.createdAt)}
                  {admin && !order.seen && <span className="new-label">NOVO</span>}
                </small>
              </div>
              <Badge status={order.status} />
              <Badge status={order.paymentStatus} />
            </div>
            <div className="order-lines">
              {order.items.map((item, index) => (
                <div className="order-line" key={`${item.itemId}-${index}`}>
                  <span>{item.quantity}×</span>
                  <div>
                    <strong>{item.name}</strong>
                    <small>
                      {item.kind === 'product'
                        ? 'Produto • pagamento na entrega'
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
              <div>
                {order.discountCents > 0 && (
                  <small>Você economizou {money(order.discountCents)}</small>
                )}
                <span>
                  Total <strong>{money(order.totalCents)}</strong>
                </span>
              </div>
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
                  {order.paymentStatus !== 'paid' && (
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
