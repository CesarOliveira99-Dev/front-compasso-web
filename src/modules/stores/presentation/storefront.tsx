'use client';
import { dayHours, clockLabel } from '@/modules/shared/presentation/weekly-hours';
import { useEffect, useState } from 'react';
import { Leaf, MapPin, Navigation, Phone, Star } from 'lucide-react';
import type { Professional } from '@/modules/shared/domain/models';
import { StoreMedia } from './store-media';
import {
  RecommendationBadge,
  Stars,
  type StoreReviewData,
} from '@/modules/feedback/presentation/reputation';
import { useResource } from '@/modules/shared/presentation/ui';
import { api } from '@/modules/shared/infrastructure/api';
import type { SectionProps } from '@/modules/shared/presentation/ui';

export function Storefront({ data, revision, openDialog }: SectionProps) {
  const reputation = useResource<StoreReviewData>('feedback/store', revision);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [embedKey, setEmbedKey] = useState('');
  useEffect(() => {
    api<Professional[]>('professionals')
      .then(setProfessionals)
      .catch(() => {});
    api<{ key: string }>('maps/config')
      .then((result) => setEmbedKey(result.key))
      .catch(() => {});
  }, []);
  const store = data.settings;
  const address = store.address;
  const location = address
    ? `${address.street}, ${address.number}${address.complement ? `, ${address.complement}` : ''}, ${address.district}, ${address.city} - ${address.state}, ${address.postalCode}, Brasil`
    : '';
  const query = encodeURIComponent(location);
  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  return (
    <section className="storefront">
      <div className="storefront-main">
        <div className="storefront-brandline">
          <span className="storefront-brandmark">
            <Leaf size={24} />
          </span>
          <span className="eyebrow">UM ESPAÇO PARA O SEU CUIDADO</span>
        </div>
        <div className="storefront-identity">
          <h1>{store.businessName}</h1>
          <a className="storefront-score-link" href="#store-reviews">
            <Stars value={store.averageRating || 0} />
            <strong>
              {store.ratingCount
                ? store.averageRating?.toFixed(1).replace('.', ',')
                : 'Novo por aqui'}
            </strong>
            {!!store.ratingCount && <small>({store.ratingCount})</small>}
          </a>
        </div>
        <RecommendationBadge recommendation={reputation.value?.recommendation} />
        {address && (
          <p className="storefront-address">
            <MapPin size={17} />
            {location.replace(', Brasil', '')}
          </p>
        )}
        {store.description && <p className="storefront-description">{store.description}</p>}
        <StoreMedia
          assets={store.media || []}
          businessName={store.businessName}
          onExpand={(category) =>
            openDialog({
              title: store.businessName,
              description: 'Conheça o espaço e os trabalhos.',
              content: (
                <StoreMedia
                  assets={store.media || []}
                  businessName={store.businessName}
                  expanded
                  initialCategory={category}
                />
              ),
            })
          }
        />
      </div>
      <aside className="panel storefront-aside">
        {location && (
          <div className="storefront-location">
            {embedKey && (
              <iframe
                title={`Mapa de ${store.businessName}`}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                src={`https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(embedKey)}&q=${query}`}
              />
            )}
            <h3>
              <MapPin size={18} /> Como chegar
            </h3>
            <p>{location.replace(', Brasil', '')}</p>
            <a
              className="button secondary small"
              href={`https://www.google.com/maps/dir/?api=1&destination=${query}`}
              target="_blank"
              rel="noreferrer"
            >
              <Navigation size={16} /> Abrir rota no Google Maps
            </a>
          </div>
        )}
        {store.phone && (
          <a className="storefront-phone" href={`tel:${store.phone.replace(/[^\d+]/g, '')}`}>
            <Phone size={17} />
            {store.phone}
          </a>
        )}
        <h3>Profissionais</h3>
        <div className="storefront-team">
          {professionals
            .filter((professional) => professional.active)
            .map((professional) => (
              <span key={professional.id}>{professional.name}</span>
            ))}
        </div>
        <h3>Horário de funcionamento</h3>
        <dl className="storefront-hours">
          {days.map((name, day) => (
            <div key={day}>
              <dt>{name}</dt>
              <dd>
                {dayHours(store, day)
                  ? `${clockLabel(dayHours(store, day)!.openingHour)} – ${clockLabel(dayHours(store, day)!.closingHour)}`
                  : 'Fechado'}
              </dd>
            </div>
          ))}
        </dl>
      </aside>
    </section>
  );
}
