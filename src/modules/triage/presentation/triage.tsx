'use client';
import { day } from '@/modules/shared/domain/format';
import type { Triage } from '@/modules/shared/domain/models';
import {
  Avatar,
  Badge,
  Empty,
  Field,
  PageHeading,
  ResourceState,
  text,
  useResource,
  type SectionProps,
} from '@/modules/shared/presentation/ui';
import { Check, X } from 'lucide-react';
export function TriagePage(props: SectionProps) {
  const resource = useResource<Triage[]>('triage', props.revision);
  const pending = resource.value?.filter((t) => t.status === 'pending') || [];
  const history = resource.value?.filter((t) => t.status !== 'pending') || [];
  function decide(triage: Triage, status: 'approved' | 'declined') {
    props.openDialog({
      title: status === 'approved' ? 'Aprovar solicitação' : 'Recusar solicitação',
      description: triage.customerName,
      content: (
        <div className="form-grid">
          <div className="quote-box">{triage.answers}</div>
          <Field label="Retorno para o cliente">
            <textarea
              name="decision"
              rows={4}
              required
              minLength={3}
              maxLength={2000}
              placeholder="Explique o próximo passo com cuidado…"
            />
          </Field>
        </div>
      ),
      submitLabel: status === 'approved' ? 'Aprovar e confirmar' : 'Confirmar recusa',
      onSubmit: async (form) => {
        await props.mutate(
          `triage/${triage.id}`,
          'PATCH',
          { status, decision: text(form, 'decision') },
          'Decisão registrada. O cliente recebeu uma notificação.',
        );
      },
    });
  }
  return (
    <>
      <PageHeading
        eyebrow="ANTES DE CUIDAR, ESCUTAR"
        title="Triagem de solicitações"
        description="Entenda cada necessidade e decida o melhor próximo passo."
      />
      <ResourceState {...resource} />
      <div className="section-title">
        <h2>Aguardando seu olhar</h2>
        <span className="count-pill">{pending.length}</span>
      </div>
      <div className="request-grid">
        {pending.map((triage) => (
          <article className="panel request-card" key={triage.id}>
            <div className="request-heading">
              <Avatar name={triage.customerName} />
              <div>
                <h3>{triage.customerName}</h3>
                <small>{day(triage.createdAt)}</small>
              </div>
              <Badge status="pending" />
            </div>
            <div className="quote-box">“{triage.answers}”</div>
            <p className="muted">
              {props.data.appointments.find((a) => a.id === triage.appointmentId)?.itemName ||
                'Solicitação de produto'}
            </p>
            <div className="request-actions">
              <button className="button secondary" onClick={() => decide(triage, 'declined')}>
                <X size={16} />
                Recusar
              </button>
              <button className="button primary" onClick={() => decide(triage, 'approved')}>
                <Check size={16} />
                Aprovar solicitação
              </button>
            </div>
          </article>
        ))}
      </div>
      {!resource.loading && !pending.length && (
        <section className="panel">
          <Empty
            title="Todas as solicitações receberam atenção"
            description="Novas triagens aparecerão aqui quando um cliente precisar de você."
          />
        </section>
      )}
      {history.length > 0 && (
        <section className="panel history-panel">
          <div className="panel-heading">
            <h2>Decisões anteriores</h2>
          </div>
          {history.map((t) => (
            <div className="summary-row" key={t.id}>
              <Avatar name={t.customerName} />
              <div>
                <strong>{t.customerName}</strong>
                <small>{t.decision}</small>
              </div>
              <Badge status={t.status} />
            </div>
          ))}
        </section>
      )}
    </>
  );
}
