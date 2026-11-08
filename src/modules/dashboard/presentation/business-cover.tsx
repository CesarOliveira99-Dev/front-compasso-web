import { Building2 } from 'lucide-react';
import type { Settings } from '@/modules/shared/domain/models';
import './business-home.css';

export function BusinessCover({ settings }: { settings: Settings }) {
  // Reuse the first photo shown in the store's "Espaço de trabalho" gallery.
  const cover = settings.media?.find(
    (asset) => asset.type === 'image' && asset.category !== 'portfolio',
  );
  return (
    <section className="business-home-cover" aria-label={`Seu espaço: ${settings.businessName}`}>
      <div className="business-home-photo">
        {cover ? (
          <img src={cover.url} alt={cover.alt || `Espaço de ${settings.businessName}`} />
        ) : (
          <Building2 size={52} strokeWidth={1} aria-hidden="true" />
        )}
      </div>
      <div className="business-home-identity">
        <span className="business-home-monogram" aria-hidden="true">
          {settings.businessName.trim().charAt(0).toUpperCase() || 'C'}
        </span>
        <div>
          <span className="eyebrow">SEU ESPAÇO DE TRABALHO</span>
          <h1>{settings.businessName}</h1>
          <p>Sua agenda, pronta para começar o dia.</p>
        </div>
      </div>
    </section>
  );
}

