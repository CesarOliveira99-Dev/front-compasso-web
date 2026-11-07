'use client';
import {RecommendationPurchase} from '@/modules/settings/presentation/recommendation-purchase';
import { useState } from 'react';
import { BadgeCheck, ShieldCheck } from 'lucide-react';
import { day } from '@/modules/shared/domain/format';
import { ResourceState, useResource } from '@/modules/shared/presentation/ui';
export interface StoreReviewData {
  summary: { count: number; average: number; distribution: Record<number, number> };
  recommendation: {
    active: boolean;
    qualified: boolean;
    paidAddonActive: boolean;
    minimumRating: number;
    minimumReviews: number;
  };
  reviews: {
    id: string;
    customerName: string;
    rating: number;
    comment: string;
    reply: string;
    createdAt: string;
    serviceName: string;
    verified: boolean;
  }[];
  page: number;
  totalPages: number;
  publicCount: number;
}
export function Stars({ value }: { value: number }) {
  const bounded = Math.max(0, Math.min(5, value));
  return (
    <span
      className="rating-stars"
      role="img"
      aria-label={`${bounded.toFixed(1).replace('.', ',')} de 5 estrelas`}
    >
      <span aria-hidden="true">★★★★★</span>
      <span aria-hidden="true" style={{ width: `${(bounded / 5) * 100}%` }}>
        ★★★★★
      </span>
    </span>
  );
}
export function RatingInput() {
  const [rating, setRating] = useState(5);
  return (
    <fieldset className="rating-input">
      <legend>Como foi sua experiência?</legend>
      <div>
        {[1, 2, 3, 4, 5].map((value) => (
          <label key={value} className={value <= rating ? 'selected' : ''}>
            <input
              type="radio"
              name="rating"
              value={value}
              checked={rating === value}
              onChange={() => setRating(value)}
              aria-label={`${value} ${value === 1 ? 'estrela' : 'estrelas'}`}
            />
            <span aria-hidden="true">★</span>
          </label>
        ))}
      </div>
      <small>{rating} de 5 estrelas</small>
    </fieldset>
  );
}
export function RatingSummary({ summary }: { summary: StoreReviewData['summary'] }) {
  return (
    <div className="reputation-summary">
      <div className="reputation-score">
        <strong>{summary.count ? summary.average.toFixed(1).replace('.', ',') : '—'}</strong>
        <Stars value={summary.average} />
        <span>
          {summary.count
            ? `${summary.count} ${summary.count === 1 ? 'avaliação verificada' : 'avaliações verificadas'}`
            : 'A primeira avaliação ainda está por vir'}
        </span>
      </div>
      <div className="rating-distribution" aria-label="Distribuição das avaliações">
        {[5, 4, 3, 2, 1].map((rating) => (
          <div key={rating}>
            <span>{rating} ★</span>
            <span className="rating-bar">
              <i
                style={{
                  width: `${summary.count ? (summary.distribution[rating] / summary.count) * 100 : 0}%`,
                }}
              />
            </span>
            <span>{summary.distribution[rating]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
export function RecommendationBadge({
  recommendation,
}: {
  recommendation?: StoreReviewData['recommendation'];
}) {
  if (!recommendation?.active) return null;
  return (
    <details className="compasso-recommendation">
      <summary>
        <BadgeCheck size={17} /> Recomendado pelo Compasso
      </summary>
      <p>
        Selo com adicional pago ativo, média mínima de 4,8/5 e pelo menos 10 avaliações de
        atendimentos concluídos no Compasso. Os critérios são reavaliados automaticamente. Não é uma
        certificação técnica do serviço.
      </p>
    </details>
  );
}
export function RecommendationPanel({ revision }: { revision: number }) {
  const resource = useResource<StoreReviewData>('feedback/store', revision);
  const result = resource.value;
  return (
    <section className="panel recommendation-panel">
      <div className="recommendation-title">
        <BadgeCheck size={25} />
        <div>
          <span className="eyebrow">RECONHECIMENTO COMPASSO</span>
          <h3>Um cuidado que inspira confiança.</h3>
        </div>
      </div>
      <ResourceState {...resource} />
      {result && (
        <>
          <RecommendationBadge recommendation={result.recommendation} />
          <ul className="recommendation-criteria">
            <li>
              <span>{result.summary.average >= 4.8 ? '✓' : '○'}</span>Média mínima de 4,8{' '}
              <strong>
                {result.summary.count ? result.summary.average.toFixed(2).replace('.', ',') : '—'}/5
              </strong>
            </li>
            <li>
              <span>{result.summary.count >= 10 ? '✓' : '○'}</span>10 avaliações verificadas{' '}
              <strong>{Math.min(result.summary.count, 10)}/10</strong>
            </li>
            <li>
              <span>{result.recommendation.paidAddonActive ? '✓' : '○'}</span>Adicional pago ativo{' '}
              <strong>{result.recommendation.paidAddonActive ? 'Ativo' : 'Inativo'}</strong>
            </li>
          </ul>
          <p>
            {result.recommendation.active
              ? 'Seu selo está visível na página da loja enquanto os critérios forem atendidos.'
              : result.recommendation.paidAddonActive
                ? 'Seu adicional está ativo. O selo aparece quando a reputação também atender aos critérios.'
                : result.recommendation.qualified
                  ? 'Sua reputação já atende aos critérios para o adicional.'
                  : 'Construa sua reputação com avaliações de quem foi atendido.'}
          </p>
          <RecommendationPurchase/>
        </>
      )}
    </section>
  );
}
export function StoreReviews({ revision }: { revision: number }) {
  const [page, setPage] = useState(1);
  return (
    <StoreReviewPage
      key={`${page}:${revision}`}
      page={page}
      revision={revision}
      setPage={setPage}
    />
  );
}
function StoreReviewPage({
  page,
  revision,
  setPage,
}: {
  page: number;
  revision: number;
  setPage: (update: (value: number) => number) => void;
}) {
  const resource = useResource<StoreReviewData>(`feedback/store?page=${page}`, revision);
  const result = resource.value;
  return (
    <section className="store-reviews panel" id="store-reviews">
      <header>
        <div>
          <span className="eyebrow">EXPERIÊNCIAS COMPARTILHADAS</span>
          <h2>Quem já veio, conta.</h2>
        </div>
        <span className="verified-caption">
          <ShieldCheck size={16} /> Após atendimentos concluídos
        </span>
      </header>
      <ResourceState {...resource} />
      {result && (
        <>
          <RatingSummary summary={result.summary} />
          <div className="public-review-grid">
            {result.reviews.map((review) => (
              <article className="public-review" key={review.id}>
                <header>
                  <span className="review-initial">{review.customerName.charAt(0)}</span>
                  <div>
                    <strong>{review.customerName}</strong>
                    <small>{day(review.createdAt)}</small>
                  </div>
                  <Stars value={review.rating} />
                </header>
                <span className="verified-caption">
                  <BadgeCheck size={14} /> Atendimento verificado · {review.serviceName}
                </span>
                <p>{review.comment}</p>
                {review.reply && (
                  <div className="public-review-reply">
                    <strong>Resposta do estabelecimento</strong>
                    <p>{review.reply}</p>
                  </div>
                )}
              </article>
            ))}
          </div>
          {!result.reviews.length && (
            <p className="reviews-empty">
              Ainda não há comentários públicos. O cliente escolhe se deseja compartilhar seu
              comentário aqui.
            </p>
          )}
          {result.totalPages > 1 && (
            <nav className="review-pagination" aria-label="Páginas de avaliações">
              <button
                type="button"
                className="button secondary small"
                disabled={page <= 1 || resource.loading}
                onClick={() => setPage((value) => value - 1)}
              >
                Anterior
              </button>
              <span>
                Página {result.page} de {result.totalPages}
              </span>
              <button
                type="button"
                className="button secondary small"
                disabled={page >= result.totalPages || resource.loading}
                onClick={() => setPage((value) => value + 1)}
              >
                Próxima
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
