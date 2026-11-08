'use client';
import { useEffect, useState } from 'react';
import { ArrowUpRight, CalendarDays, Check, Flower2, RotateCcw, Star, UserRound, X } from 'lucide-react';
import type { User } from '@/modules/shared/domain/models';
import { api } from '@/modules/shared/infrastructure/api';
import { Dialog, Field, type DialogState } from '@/modules/shared/presentation/ui';
import { RatingInput } from '@/modules/feedback/presentation/reputation';

export interface LastVisit {
  key: string;
  appointmentId: string;
  service: { id: string; name: string; image?: string; available: boolean };
  store: { slug: string; name: string; image?: string };
  professionalName: string;
  startsAt: string;
  timezone: string;
  review: { rating: number } | null;
}

export function LastVisitCard({ visit, busy, onDismiss, onReview, onBook }: {
  visit: LastVisit; busy: boolean; onDismiss: () => void; onReview: () => void; onBook: () => void;
}) {
  const date = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: visit.timezone }).format(new Date(visit.startsAt));
  const time = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: visit.timezone }).format(new Date(visit.startsAt));
  return (
    <section className="last-care" aria-labelledby="last-care-title">
      <div className="last-care-heading">
        <div><span className="eyebrow">SEU CUIDADO CONTINUA</span><h2 id="last-care-title">Seu último atendimento</h2></div>
        <button className="last-care-dismiss" aria-label="Fechar card do último atendimento" onClick={onDismiss} disabled={busy}><X size={19} /></button>
      </div>
      <article className="last-care-card">
        <div className="last-care-photo">
          {visit.service.image ? <img src={visit.service.image} alt={visit.service.name} onError={(event) => { event.currentTarget.hidden = true; }} /> : null}
          <Flower2 className="last-care-placeholder" size={56} strokeWidth={1} aria-hidden="true" />
          <span className="last-care-completed"><Check size={13} /> Atendimento concluído</span>
        </div>
        <div className="last-care-content">
          <a className="last-care-store" href={`/loja?slug=${encodeURIComponent(visit.store.slug)}`}>
            <span className="last-care-store-icon">{visit.store.image ? <img src={visit.store.image} alt="" /> : <Flower2 size={19} />}</span>
            <span>{visit.store.name}</span><ArrowUpRight size={15} />
          </a>
          <h3>{visit.service.name}</h3>
          <dl className="last-care-details">
            <div><dt><CalendarDays size={16} /><span className="sr-only">Data e horário</span></dt><dd><time dateTime={visit.startsAt}>{date} <span>· {time}</span></time></dd></div>
            <div><dt><UserRound size={16} /><span className="sr-only">Profissional</span></dt><dd>Com <strong>{visit.professionalName}</strong></dd></div>
          </dl>
          <div className="last-care-bottom">
            <p>{visit.review ? 'Obrigada por compartilhar sua experiência.' : 'Como foi esse momento? Sua opinião faz a diferença.'}</p>
            <div className="last-care-actions">
              {visit.review ? <span className="last-care-reviewed"><Star size={16} /> Avaliado · {visit.review.rating}/5</span> :
                <button className="button primary" onClick={onReview} disabled={busy}><Star size={16} /> Avaliar</button>}
              <button className="button secondary" onClick={onBook} disabled={busy || !visit.service.available}><RotateCcw size={16} /> {busy ? 'Abrindo agenda…' : 'Agendar novamente'}</button>
            </div>
            {!visit.service.available && <small>Este serviço não está disponível para novos agendamentos.</small>}
          </div>
        </div>
      </article>
    </section>
  );
}

export function LastVisitPanel({ user, revision = 0 }: { user: User; revision?: number }) {
  const [visit, setVisit] = useState<LastVisit | null>(null);
  const [dismissed, setDismissed] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [dialog, setDialog] = useState<DialogState>();
  const storageKey = `compasso:last-visit-dismissed:${user.identityId || user.id}`;
  useEffect(() => {
    let active = true;
    const refresh = () => {
      if (document.visibilityState !== 'visible') return;
      api<{ visit: LastVisit | null }>('auth/last-visit').then(({ visit: value }) => {
        if (!active) return;
        setVisit(value); setError('');
        try { setDismissed(localStorage.getItem(storageKey) || ''); } catch { /* Storage is optional. */ }
      }).catch(() => { if (active) setError('Não foi possível carregar seu último atendimento. Atualize a página para tentar novamente.'); });
    };
    refresh();
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    const timer = setInterval(refresh, 60000);
    return () => { active = false; clearInterval(timer); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh); };
  }, [storageKey, revision]);
  function dismiss() {
    if (!visit) return;
    setDismissed(visit.key);
    try { localStorage.setItem(storageKey, visit.key); } catch { /* Closing still works in this session. */ }
  }
  function review() {
    if (!visit) return;
    const selected = visit;
    setDialog({
      title: 'Como foi seu atendimento?', description: `${selected.service.name} · ${selected.store.name}`,
      content: <div className="form-grid"><RatingInput /><Field label="Conte um pouco mais"><textarea name="comment" required minLength={3} maxLength={2000} rows={4} placeholder="O que você achou desse cuidado?" /></Field><label className="checkbox-field"><input type="checkbox" name="published" /> Publicar meu comentário na página da loja, com meu primeiro nome.</label></div>,
      submitLabel: 'Enviar minha avaliação',
      onSubmit: async (form) => {
        const rating = Number(form.get('rating'));
        await api('auth/last-visit/review', 'POST', { key: selected.key, rating, comment: String(form.get('comment') || ''), published: form.has('published') });
        setVisit((current) => current?.key === selected.key ? { ...current, review: { rating } } : current);
      },
    });
  }
  async function book() {
    if (!visit || busy) return;
    setBusy(true); setError('');
    try {
      await api('auth/switch-store', 'POST', { slug: visit.store.slug });
      location.assign(`/?repetir=${encodeURIComponent(visit.service.id)}`);
    } catch (error) { setError(error instanceof Error ? error.message : 'Não foi possível abrir a agenda.'); setBusy(false); }
  }
  return <>
    {visit && dismissed !== visit.key && <LastVisitCard visit={visit} busy={busy} onDismiss={dismiss} onReview={review} onBook={() => void book()} />}
    {error && <p className="form-note" role="alert">{error}</p>}
    {dialog && <Dialog dialog={dialog} close={() => setDialog(undefined)} />}
  </>;
}
