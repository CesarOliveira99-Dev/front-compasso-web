'use client';
import { ArrowUpRight, History, RotateCcw } from 'lucide-react';
import { Greeting } from '@/modules/shared/presentation/greeting';
import { Discovery } from '@/modules/stores/presentation/discovery';
import { openBooking } from '@/modules/appointments/presentation/booking-dialog';
import { day, time } from '@/modules/shared/domain/format';
import { type SectionProps } from '@/modules/shared/presentation/ui';

export function CustomerHome(props: SectionProps) {
  const last = props.data.appointments
    .filter((appointment) => appointment.status === 'completed')
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt))[0];
  return (
    <div className="pulse-customer-home">
      <header className="pulse-customer-heading">
        <Greeting name={props.data.user.name} />
        <h1>
          Um bom cuidado
          <br />
          começa por aqui.
        </h1>
        <p>Encontre estabelecimentos, conheça a equipe e escolha seu horário.</p>
      </header>
      <Discovery
        embedded
        beforeResults={
          last && (
            <section className="pulse-last-visit panel">
              <div>
                <span className="last-visit-kicker">
                  <History size={17} /> Seu último atendimento nesta loja
                </span>
                <h2>{last.itemName}</h2>
                <p>
                  {props.data.settings.businessName} · {day(last.startsAt)} · {time(last.startsAt)}
                </p>
                <small>{last.professionalName || props.data.settings.name}</small>
              </div>
              <div className="booking-navigation">
                <a
                  className="button secondary"
                  href={`/loja?slug=${encodeURIComponent(props.data.settings.slug)}`}
                >
                  Ver loja <ArrowUpRight size={16} />
                </a>
                <button
                  className="button primary"
                  onClick={() =>
                    openBooking(props, last.itemId).catch((error) =>
                      props.notify(error.message, true),
                    )
                  }
                >
                  <RotateCcw size={16} /> Agendar novamente
                </button>
              </div>
            </section>
          )
        }
      />
    </div>
  );
}
