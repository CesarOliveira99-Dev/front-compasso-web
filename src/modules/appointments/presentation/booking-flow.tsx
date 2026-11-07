'use client';
import { useEffect, useRef, useState } from 'react';
import { day, localInput, money, time } from '@/modules/shared/domain/format';
import type { Appointment, Customer, Professional } from '@/modules/shared/domain/models';
import { api } from '@/modules/shared/infrastructure/api';
import { Field, type SectionProps } from '@/modules/shared/presentation/ui';
interface Availability {
  priceCents: number;
  durationMinutes: number;
  slots: { startsAt: string; label: string }[];
}
interface Quote {
  totalCents: number;
}
type FlowProps = SectionProps & {
  professionals: Professional[];
  customers: Customer[];
  initialItemId?: string;
  appointment?: Appointment;
  close: () => void;
  setDialogBusy: (busy: boolean) => void;
};
const steps = ['Serviço', 'Profissional', 'Dia', 'Horário', 'Confirmar'];
export function BookingFlow(props: FlowProps) {
  const { appointment, professionals, data } = props;
  const admin = data.user.role === 'admin';
  const [step, setStep] = useState(appointment ? 2 : props.initialItemId ? 1 : 0);
  const [itemId, setItemId] = useState(appointment?.itemId || props.initialItemId || '');
  const [professionalId, setProfessionalId] = useState(
    appointment ? appointment.professionalId || 'principal' : '',
  );
  const [date, setDate] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [notes, setNotes] = useState('');
  const [coupon, setCoupon] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  const [availability, setAvailability] = useState<{ key: string; value: Availability }>();
  const [availabilityError, setAvailabilityError] = useState('');
  const [quote, setQuote] = useState<{ key: string; value: Quote }>();
  const [quoteError, setQuoteError] = useState('');
  const [quoteKey] = useState(() => crypto.randomUUID());
  const submitted = useRef<{ fingerprint: string; key: string } | undefined>(undefined);
  const settings = data.settings;
  const methods = [
    ...(settings.payOnAppointment
      ? [{ id: 'on_day', label: 'Pagar pessoalmente após o serviço' }]
      : []),
    ...(settings.manualPixEnabled
      ? [{ id: 'pix_manual', label: 'Pix direto ao estabelecimento' }]
      : []),
    ...(settings.onlinePaymentsEnabled
      ? [{ id: 'online', label: 'Mercado Pago — Pix ou cartão' }]
      : []),
  ];
  const [paymentMethod, setPaymentMethod] = useState(methods[0]?.id || '');
  const item = data.catalog.find((item) => item.id === itemId);
  const professional = professionals.find((profile) => profile.id === professionalId);
  const eligible = professionals.filter(
    (profile) =>
      profile.active && (!profile.serviceIds.length || profile.serviceIds.includes(itemId)),
  );
  const query = new URLSearchParams({
    itemId,
    professionalId,
    date,
    ...(appointment ? { appointmentId: appointment.id } : {}),
  }).toString();
  const currentAvailability = availability?.key === query ? availability.value : undefined;
  const slot = currentAvailability?.slots.find((slot) => slot.startsAt === startsAt);
  const durationMinutes = appointment
    ? (Date.parse(appointment.endsAt) - Date.parse(appointment.startsAt)) / 60000
    : item?.durationMinutes;
  const needsNotes = !!item?.requiresTriage && notes.trim().length < 5;
  const orderInput = JSON.stringify({
    items: [{ itemId, professionalId, startsAt, quantity: 1, notes }],
    paymentMethod,
    coupon: coupon.trim() || undefined,
    idempotencyKey: quoteKey,
  });
  const currentQuote = quote?.key === orderInput ? quote.value : undefined;
  useEffect(() => {
    let current = true;
    setAvailabilityError('');
    setAvailability(undefined);
    if (!date || !professionalId || !itemId) return;
    api<Availability>(`appointments/availability?${query}`)
      .then((value) => {
        if (current) setAvailability({ key: query, value });
      })
      .catch((error) => {
        if (current) setAvailabilityError(error.message);
      });
    return () => {
      current = false;
    };
  }, [query, date, professionalId, itemId, retry]);
  useEffect(() => {
    let current = true;
    setQuote(undefined);
    setQuoteError('');
    if (step !== 4 || admin || appointment || !slot || !paymentMethod || needsNotes) return;
    const timer = setTimeout(() => {
      api<Quote>('orders/quote', 'POST', JSON.parse(orderInput))
        .then((value) => {
          if (current) setQuote({ key: orderInput, value });
        })
        .catch((error) => {
          if (current) setQuoteError(error.message);
        });
    }, 250);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [orderInput, step, admin, appointment, slot, paymentMethod, needsNotes, retry]);
  async function confirm() {
    if (!slot || !currentAvailability || busy) return;
    if (!appointment && (needsNotes || (admin ? !customerId : !currentQuote || !paymentMethod)))
      return;
    setBusy(true);
    props.setDialogBusy(true);
    setError('');
    try {
      if (appointment)
        await props.mutate(
          `appointments/${appointment.id}`,
          'PATCH',
          { startsAt },
          'Horário atualizado.',
        );
      else {
        const direct = admin || (paymentMethod === 'on_day' && !coupon.trim());
        const body = direct
          ? {
              itemId,
              professionalId,
              startsAt,
              notes,
              ...(admin ? { customerId } : {}),
              expectedPriceCents: currentAvailability.priceCents,
            }
          : { ...JSON.parse(orderInput), expectedTotalCents: currentQuote?.totalCents };
        const fingerprint = JSON.stringify({ direct, body });
        const submission =
          submitted.current?.fingerprint === fingerprint
            ? submitted.current
            : { fingerprint, key: crypto.randomUUID() };
        submitted.current = submission;
        await props.mutate(
          direct ? 'appointments' : 'orders',
          'POST',
          { ...body, idempotencyKey: submission.key },
          item?.requiresTriage
            ? 'Solicitação enviada para triagem.'
            : paymentMethod === 'on_day' || admin
              ? 'Agendamento confirmado. Pagamento pendente para o atendimento.'
              : 'Agendamento registrado. Consulte o pagamento em Meus pedidos.',
        );
        props.navigate(direct ? 'appointments' : 'orders');
      }
      props.close();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Não foi possível confirmar.');
      setRetry((value) => value + 1);
    } finally {
      setBusy(false);
      props.setDialogBusy(false);
    }
  }
  return (
    <div className="booking-flow">
      <ol className="booking-steps" aria-label="Etapas do agendamento">
        {steps.map((label, index) => (
          <li key={label} aria-current={index === step ? 'step' : undefined}>
            <span>{index + 1}</span>
            {label}
          </li>
        ))}
      </ol>
      <fieldset className="form-grid" disabled={busy}>
        {step === 0 && (
          <>
            <h3>Qual cuidado você procura?</h3>
            <div className="booking-options">
              {data.catalog
                .filter((item) => item.active && item.kind === 'service')
                .map((service) => (
                  <button
                    type="button"
                    className="booking-option"
                    key={service.id}
                    onClick={() => {
                      setItemId(service.id);
                      setProfessionalId('');
                      setDate('');
                      setStartsAt('');
                      setStep(1);
                    }}
                  >
                    <strong>{service.name}</strong>
                    <small>
                      {service.durationMinutes} min · {money(service.currentPriceCents)}
                    </small>
                  </button>
                ))}
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <h3>Com quem você quer agendar?</h3>
            <p>{item?.name}</p>
            <div className="booking-options">
              {eligible.map((profile) => (
                <button
                  type="button"
                  className="booking-option"
                  key={profile.id}
                  onClick={() => {
                    setProfessionalId(profile.id);
                    setDate('');
                    setStartsAt('');
                    setStep(2);
                  }}
                >
                  <strong>{profile.name}</strong>
                  <small>Ver horários disponíveis →</small>
                </button>
              ))}
            </div>
            {!eligible.length && (
              <p>Nenhum profissional disponível para este serviço. Entre em contato com a loja.</p>
            )}
          </>
        )}
        {step === 2 && (
          <>
            <h3>Qual dia fica bom para você?</h3>
            <p>
              {item?.name} · {professional?.name}
            </p>
            <Field label="Dia do atendimento">
              <input
                type="date"
                min={localInput().slice(0, 10)}
                value={date}
                onChange={(event) => {
                  setDate(event.target.value);
                  setStartsAt('');
                }}
              />
            </Field>
            <button
              type="button"
              className="button primary"
              disabled={!date || date < localInput().slice(0, 10)}
              onClick={() => setStep(3)}
            >
              Ver horários livres
            </button>
          </>
        )}
        {step === 3 && (
          <>
            <h3>Escolha seu horário</h3>
            <p>
              {professional?.name} · {day(date)} · {durationMinutes} min
            </p>
            <p className="form-note">
              Horário de Brasília. O atendimento inteiro precisa caber na agenda.
            </p>
            {!currentAvailability && !availabilityError && (
              <p role="status">Consultando horários…</p>
            )}
            {availabilityError && (
              <>
                <p role="alert" className="error-message">
                  {availabilityError}
                </p>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setRetry((value) => value + 1)}
                >
                  Tentar novamente
                </button>
              </>
            )}
            {currentAvailability &&
              (currentAvailability.slots.length ? (
                <div className="booking-slots">
                  {currentAvailability.slots.map((slot) => (
                    <button
                      type="button"
                      className="button secondary"
                      key={slot.startsAt}
                      onClick={() => {
                        setStartsAt(slot.startsAt);
                        setStep(4);
                      }}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              ) : (
                <p>Nenhum horário livre neste dia. Escolha outra data.</p>
              ))}
          </>
        )}
        {step === 4 && (
          <>
            <h3>Confira seu encontro</h3>
            <div className="booking-summary">
              <strong>{item?.name}</strong>
              <span>{professional?.name}</span>
              <span>
                {day(date)} às {time(startsAt)} · {durationMinutes} min
              </span>
              <strong>
                {money(
                  appointment?.priceCents ??
                    currentQuote?.totalCents ??
                    currentAvailability?.priceCents ??
                    0,
                )}
              </strong>
            </div>
            {!slot && (
              <p className="error-message" role="alert">
                Este horário precisa ser consultado novamente. Volte para os horários livres.
              </p>
            )}
            {appointment ? (
              <p>O reagendamento mantém o valor e o pagamento já registrados.</p>
            ) : (
              <>
                {admin && (
                  <Field label="Cliente">
                    <select
                      value={customerId}
                      onChange={(event) => setCustomerId(event.target.value)}
                    >
                      <option value="">Selecione um cliente</option>
                      {props.customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}
                <Field
                  label={
                    item?.requiresTriage
                      ? 'Descreva sua necessidade (obrigatório)'
                      : 'Observações (opcional)'
                  }
                  hint={
                    item?.requiresTriage
                      ? 'No mínimo 5 caracteres. A loja precisa aprovar a triagem.'
                      : undefined
                  }
                >
                  <textarea
                    rows={3}
                    maxLength={2000}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                  />
                </Field>
                {!admin && (
                  <>
                    <Field label="Como prefere pagar?">
                      <select
                        value={paymentMethod}
                        onChange={(event) => setPaymentMethod(event.target.value)}
                      >
                        {!methods.length && <option value="">Nenhuma forma disponível</option>}
                        {methods.map((method) => (
                          <option key={method.id} value={method.id}>
                            {method.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <p className="form-note">
                      {paymentMethod === 'on_day'
                        ? 'Você apenas agenda agora. O pagamento fica pendente e é feito pessoalmente após o serviço.'
                        : paymentMethod === 'pix_manual'
                          ? 'Após agendar, veja a chave em Meus pedidos. A loja confirma o recebimento.'
                          : paymentMethod === 'online'
                            ? 'Após agendar, continue em Meus pedidos para abrir o Mercado Pago. Serviços com triagem aguardam aprovação.'
                            : 'Entre em contato com a loja para agendar.'}
                    </p>
                    {!!methods.length && (
                      <Field label="Cupom (opcional)">
                        <input
                          value={coupon}
                          maxLength={40}
                          onChange={(event) => setCoupon(event.target.value.toUpperCase())}
                        />
                      </Field>
                    )}
                    {quoteError && (
                      <p className="error-message" role="alert">
                        {quoteError}
                      </p>
                    )}
                    {!currentQuote && !quoteError && !needsNotes && !!paymentMethod && (
                      <p role="status">Conferindo o valor…</p>
                    )}
                  </>
                )}
              </>
            )}
            <button
              type="button"
              className="button primary"
              disabled={
                busy ||
                !slot ||
                (!appointment &&
                  (needsNotes || (admin ? !customerId : !currentQuote || !paymentMethod)))
              }
              onClick={confirm}
            >
              {busy
                ? 'Confirmando…'
                : appointment
                  ? 'Salvar novo horário'
                  : item?.requiresTriage
                    ? 'Solicitar agendamento'
                    : !admin && paymentMethod === 'on_day'
                      ? 'Agendar e pagar após o serviço'
                      : 'Confirmar agendamento'}
            </button>
          </>
        )}
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
        <div className="booking-navigation">
          {step > (appointment ? 2 : 0) && (
            <button
              type="button"
              className="button secondary"
              disabled={busy}
              onClick={() => {
                setError('');
                setStep(step - 1);
              }}
            >
              Voltar
            </button>
          )}
          <button type="button" className="text-button" disabled={busy} onClick={props.close}>
            Fechar
          </button>
        </div>
      </fieldset>
    </div>
  );
}
