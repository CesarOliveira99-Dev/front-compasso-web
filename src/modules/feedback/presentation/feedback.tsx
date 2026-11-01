'use client';
import { day } from '@/modules/shared/domain/format';
import type { Customer, Feedback } from '@/modules/shared/domain/models';
import { api } from '@/modules/shared/infrastructure/api';
import {
  AddButton,
  Avatar,
  Empty,
  Field,
  PageHeading,
  ResourceState,
  number,
  text,
  useResource,
  type SectionProps,
} from '@/modules/shared/presentation/ui';
import { MessageCircle, MessageSquare } from 'lucide-react';
export function FeedbackPage(props: SectionProps) {
  const resource = useResource<Feedback[]>('feedback', props.revision);
  const admin = props.data.user.role === 'admin';
  const eligible = props.data.appointments.filter(
    (a) => a.status === 'completed' && !resource.value?.some((f) => f.appointmentId === a.id),
  );
  function review() {
    props.openDialog({
      title: 'Seu olhar faz a diferença',
      description: 'Conte como foi seu atendimento.',
      content: (
        <div className="form-grid">
          <Field label="Atendimento">
            <select name="appointmentId" required>
              <option value="">Selecione um atendimento</option>
              {eligible.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.itemName} • {day(a.startsAt)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Como foi sua experiência?">
            <select name="rating" defaultValue="5">
              {[5, 4, 3, 2, 1].map((rating) => (
                <option value={rating} key={rating}>
                  {'★'.repeat(rating)} —{' '}
                  {
                    ['', 'Precisa melhorar', 'Abaixo do esperado', 'Bom', 'Muito bom', 'Excelente'][
                      rating
                    ]
                  }
                </option>
              ))}
            </select>
          </Field>
          <Field label="Conte um pouco mais">
            <textarea
              name="comment"
              rows={4}
              required
              minLength={3}
              maxLength={2000}
              placeholder="O que tornou esse momento especial? O que podemos melhorar?"
            />
          </Field>
        </div>
      ),
      submitLabel: 'Enviar minha avaliação',
      onSubmit: async (form) => {
        await props.mutate(
          'feedback',
          'POST',
          {
            appointmentId: text(form, 'appointmentId'),
            rating: number(form, 'rating'),
            comment: text(form, 'comment'),
          },
          'Obrigada por compartilhar sua experiência.',
        );
      },
    });
  }
  async function reply(feedback: Feedback) {
    const customers = await api<Customer[]>('customers');
    const customer = customers.find((c) => c.id === feedback.customerId);
    props.openDialog({
      title: `Responder a ${feedback.customerName.split(' ')[0]}`,
      content: (
        <div className="form-grid">
          <div className="quote-box">“{feedback.comment}”</div>
          <Field label="Sua resposta">
            <textarea
              name="reply"
              defaultValue={feedback.reply}
              rows={5}
              minLength={3}
              maxLength={2000}
              required
              placeholder="Uma resposta atenciosa faz toda a diferença…"
            />
          </Field>
          {customer && (
            <a
              className="button secondary"
              href={`https://wa.me/${customer.phone.replace(/\D/g, '').replace(/^(?!55)/, '55')}?text=${encodeURIComponent(`Olá, ${customer.name.split(' ')[0]}! Obrigada pela sua avaliação sobre nosso atendimento. Gostaria de conversar com você.`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={17} />
              Conversar pelo WhatsApp
            </a>
          )}
          <p className="form-note">
            A resposta será salva e enviada nas notificações do cliente. O link do WhatsApp abre a
            conversa para envio manual.
          </p>
        </div>
      ),
      submitLabel: 'Enviar resposta',
      onSubmit: async (form) => {
        await props.mutate(
          `feedback/${feedback.id}`,
          'PATCH',
          { reply: text(form, 'reply') },
          'Resposta enviada ao cliente.',
        );
      },
    });
  }
  const average = resource.value?.length
    ? resource.value.reduce((sum, f) => sum + f.rating, 0) / resource.value.length
    : 0;
  return (
    <>
      <PageHeading
        eyebrow="CADA EXPERIÊNCIA IMPORTA"
        title={admin ? 'A voz dos seus clientes' : 'Minhas avaliações'}
        description={
          admin
            ? 'Escute, acolha e transforme cada retorno em conexão.'
            : 'Compartilhe sua experiência e ajude a tornar cada cuidado melhor.'
        }
        action={!admin && <AddButton onClick={review}>Avaliar atendimento</AddButton>}
      />
      <ResourceState {...resource} />
      <div className="feedback-overview panel">
        <span className="rating-number">{average.toFixed(1).replace('.', ',')}</span>
        <div>
          <div className="stars">
            {'★'.repeat(Math.round(average))}
            {'☆'.repeat(5 - Math.round(average))}
          </div>
          <p>{resource.value?.length || 0} experiências compartilhadas</p>
        </div>
        <span className="feedback-overview-note">
          <MessageSquare size={21} />
          Boas conversas fazem bons negócios.
        </span>
      </div>
      <div className="feedback-grid">
        {resource.value?.map((feedback, index) => (
          <article className="panel feedback-card" key={feedback.id}>
            <div className="request-heading">
              <Avatar name={feedback.customerName} color={index} />
              <div>
                <h3>{feedback.customerName}</h3>
                <small>{day(feedback.createdAt)}</small>
              </div>
              <span className="stars">
                {'★'.repeat(feedback.rating)}
                {'☆'.repeat(5 - feedback.rating)}
              </span>
            </div>
            <blockquote>“{feedback.comment}”</blockquote>
            {feedback.reply && (
              <div className="feedback-reply">
                <strong>Sua conexão com o estúdio</strong>
                <p>{feedback.reply}</p>
              </div>
            )}
            {admin && (
              <button
                className="button secondary small"
                onClick={() => reply(feedback).catch((e) => props.notify(e.message, true))}
              >
                <MessageCircle size={15} />
                {feedback.reply ? 'Atualizar resposta' : 'Responder com cuidado'}
              </button>
            )}
          </article>
        ))}
      </div>
      {!resource.loading && !resource.value?.length && (
        <Empty
          title="Sua história ainda vai ganhar palavras"
          description="As avaliações ficam disponíveis após o atendimento ser finalizado."
        />
      )}
    </>
  );
}
