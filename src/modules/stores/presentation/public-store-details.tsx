'use client';
import { dayHours, clockLabel } from '@/modules/shared/presentation/weekly-hours';
import {
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
  Users,
  MessageCircle,
} from 'lucide-react';
import {
  Stars,
  RatingSummary,
  RecommendationBadge,
} from '@/modules/feedback/presentation/reputation';
import { day, initials } from '@/modules/shared/domain/format';
import type { PublicStoreData } from './public-store.models';
import { hourLabel, weekDays } from './public-store.models';
export function VenueDetails({ data }: { data: PublicStoreData }) {
  const { store } = data;
  const address = store.address;
  const fullAddress = address
    ? `${address.street}, ${address.number}${address.complement ? `, ${address.complement}` : ''}, ${address.district}, ${address.city} - ${address.state}, ${address.postalCode}`
    : '';
  const today = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short' }).format(
      new Date(),
    ),
  );
  return (
    <>
      <section className="venue-card" id="sobre">
        <div className="venue-card-title">
          <span className="venue-icon">
            <MapPin size={19} />
          </span>
          <h2>Sobre o espaço</h2>
        </div>
        <p>
          {store.description ||
            'Um lugar dedicado a cuidar de você. Explore os serviços, conheça a equipe e escolha seu próximo atendimento.'}
        </p>
        <div className="venue-address">
          <strong>Onde estamos</strong>
          <p>{fullAddress || 'O endereço será informado pelo estabelecimento.'}</p>
          {address && (
            <a
              className="venue-text-link"
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`}
              target="_blank"
              rel="noreferrer"
            >
              <Navigation size={15} /> Como chegar
            </a>
          )}
        </div>
        {store.phone && (
          <a className="venue-contact" href={`tel:${store.phone.replace(/[^\d+]/g, '')}`}>
            <Phone size={18} />
            <span>
              <small>Fale com o estabelecimento</small>
              <strong>{store.phone.replace(/^(?:55)?(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')}</strong>
            </span>
          </a>
        )}
      </section>
      <section className="venue-card" id="horarios">
        <div className="venue-card-title">
          <span className="venue-icon">
            <Clock3 size={19} />
          </span>
          <h2>Horários de atendimento</h2>
        </div>
        <dl className="venue-hours">
          {weekDays.map((name, index) => (
            <div className={today === index ? 'is-today' : ''} key={name}>
              <dt>
                {name}
                {today === index && <span>Hoje</span>}
              </dt>
              <dd>
                {dayHours(store, index)
                  ? `${clockLabel(dayHours(store, index)!.openingHour)} – ${clockLabel(dayHours(store, index)!.closingHour)}`
                  : 'Fechado'}
              </dd>
            </div>
          ))}
        </dl>
        <p className="venue-footnote">
          Horário de Brasília. Consulte a disponibilidade ao agendar.
        </p>
      </section>
      <section className="venue-card venue-how">
        <div className="venue-card-title">
          <span className="venue-icon">
            <CalendarDays size={19} />
          </span>
          <h2>Seu cuidado, sem complicação</h2>
        </div>
        <ol>
          <li>
            <span>1</span>
            <div>
              <strong>Encontre seu cuidado</strong>
              <p>Explore os serviços e escolha o que combina com você.</p>
            </div>
          </li>
          <li>
            <span>2</span>
            <div>
              <strong>Escolha dia e profissional</strong>
              <p>Entre na sua conta e veja os horários disponíveis.</p>
            </div>
          </li>
          <li>
            <span>3</span>
            <div>
              <strong>Confirme seu agendamento</strong>
              <p>Revise os detalhes antes de reservar.</p>
            </div>
          </li>
        </ol>
      </section>
    </>
  );
}
export function VenueTeam({ data }: { data: PublicStoreData }) {
  return (
    <section className="venue-card venue-section" id="equipe">
      <div className="venue-section-heading">
        <div>
          <span className="venue-kicker">GENTE QUE CUIDA DE VOCÊ</span>
          <h2>Conheça a equipe</h2>
        </div>
        <span className="venue-count">
          <Users size={15} />
          {data.professionals.length}
        </span>
      </div>
      <div className="venue-team-grid">
        {data.professionals.map((person, index) => (
          <article className="venue-person" key={person.id}>
            <span className={`venue-person-avatar shade-${index % 3}`}>
              {initials(person.name)}
            </span>
            <h3>{person.name}</h3>
            <p>
              {person.serviceIds.length
                ? data.catalog
                    .filter((item) => person.serviceIds.includes(item.id))
                    .map((item) => item.name)
                    .slice(0, 2)
                    .join(' · ') || 'Atendimento no estabelecimento'
                : 'Atendimento no estabelecimento'}
            </p>
            <span>
              <Check size={13} /> Integrante da equipe
            </span>
          </article>
        ))}
      </div>
      {!data.professionals.length && <p>A equipe será apresentada em breve.</p>}
    </section>
  );
}
export function VenueReviews({ data }: { data: PublicStoreData }) {
  const { reputation } = data;
  return (
    <section className="venue-card venue-section" id="avaliacoes">
      <div className="venue-section-heading">
        <div>
          <span className="venue-kicker">EXPERIÊNCIAS REAIS</span>
          <h2>Quem já veio, conta</h2>
        </div>
        <ShieldCheck size={24} />
      </div>
      <RatingSummary summary={reputation.summary} />
      <RecommendationBadge recommendation={reputation.recommendation} />
      <div className="venue-review-note">
        <ShieldCheck size={16} />
        <span>
          Avaliações de atendimentos concluídos. Cada cliente escolhe se deseja publicar seu
          comentário.
        </span>
      </div>
      {reputation.reviews.length > 0 ? (
        <div className="venue-review-list">
          {reputation.reviews.map((review) => (
            <article className="venue-review" key={review.id}>
              <header>
                <span className="venue-review-avatar">{initials(review.customerName)}</span>
                <div>
                  <strong>{review.customerName}</strong>
                  <span>
                    <ShieldCheck size={12} /> Atendimento verificado
                  </span>
                </div>
                <time dateTime={review.createdAt}>{day(review.createdAt)}</time>
              </header>
              <Stars value={review.rating} />
              <p>{review.comment}</p>
              <small>{review.serviceName}</small>
              {review.reply && (
                <div className="venue-review-reply">
                  <strong>Resposta do estabelecimento</strong>
                  <p>{review.reply}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="venue-empty">
          <MessageCircle size={26} />
          <h3>A próxima experiência pode ser a sua</h3>
          <p>Ainda não há comentários públicos neste espaço.</p>
        </div>
      )}
    </section>
  );
}
