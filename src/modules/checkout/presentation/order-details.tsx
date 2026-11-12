import { Badge } from '@/modules/shared/presentation/ui';
import { day, money, time } from '@/modules/shared/domain/format';
import type { Order } from '@/modules/shared/domain/models';
export function OrderDetails({ order }: { order: Order }) {
  const method = { online: 'Crédito ou Pix', pix_manual: 'Pix direto à loja', on_day: 'Pagar no dia / na entrega' }[order.paymentMethod];
  return <div className="order-details">
    <dl><div><dt>Realizado em</dt><dd>{day(order.createdAt)} às {time(order.createdAt)}</dd></div>
      <div><dt>Pagamento</dt><dd><Badge status={order.paymentStatus}>{order.paymentStatus === 'paid' ? 'Pagamento confirmado' : 'Pagamento pendente'}</Badge></dd></div>
      <div><dt>Forma de pagamento</dt><dd>{method}</dd></div></dl>
    {order.status === 'cancelled' && <p role="status">Este pedido foi cancelado. Se já houve pagamento, confirme com a loja a situação do reembolso.</p>}
    <h3>Itens do pedido</h3>
    <ul className="order-detail-items">{order.items.map((item, index) => <li key={`${item.itemId}-${index}`}>
      <div><strong>{item.quantity}× {item.name}</strong><small>{item.kind === 'service' ? 'Serviço' : 'Produto'}{item.startsAt ? ` • ${day(item.startsAt)} às ${time(item.startsAt)}` : ''}</small></div>
      <strong>{money(item.unitPriceCents * item.quantity)}</strong>
    </li>)}</ul>
    <dl><div><dt>Subtotal</dt><dd>{money(order.totalCents + order.discountCents)}</dd></div>
      {order.discountCents > 0 && <div><dt>Desconto</dt><dd>− {money(order.discountCents)}</dd></div>}
      <div><dt>Total</dt><dd><strong>{money(order.totalCents)}</strong></dd></div></dl>
    {order.address && <p><strong>Entrega:</strong> {order.address.street}, {order.address.number} • {order.address.city} • CEP {order.address.postalCode}</p>}
    {order.paymentMethod === 'pix_manual' && order.paymentStatus !== 'paid' && order.status !== 'cancelled' && <p>Chave Pix da loja: <strong>{order.pixKey || 'Confirme com a loja'}</strong>. Aguarde a aprovação de eventual triagem antes de pagar.</p>}
    {order.items.some(item => item.kind === 'service') && <p>Para acompanhar, reagendar ou cancelar um atendimento, acesse Meus agendamentos. O pagamento e a realização do serviço são acompanhados separadamente.</p>}
  </div>;
}
