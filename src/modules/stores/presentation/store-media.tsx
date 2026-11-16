'use client';
import { useState } from 'react';
import { Camera, Images, Leaf } from 'lucide-react';
import type { MediaAsset } from '@/modules/shared/domain/models';
import { MediaGallery } from '@/modules/shared/presentation/media-editor';
export function StoreMedia({
  assets,
  businessName,
  expanded = false,
  onExpand,
  initialCategory,
}: {
  assets: MediaAsset[];
  businessName: string;
  expanded?: boolean;
  onExpand?: (category: 'workspace' | 'portfolio') => void;
  initialCategory?: 'workspace' | 'portfolio';
}) {
  const [category, setCategory] = useState<'workspace' | 'portfolio'>(
    initialCategory ||
      (assets.length && assets.every((asset) => asset.category === 'portfolio')
        ? 'portfolio'
        : 'workspace'),
  );
  const workspace = assets.filter((asset) => asset.category !== 'portfolio');
  const portfolio = assets.filter((asset) => asset.category === 'portfolio');
  const selection = category === 'workspace' ? workspace : portfolio;
  return (
    <div className={`store-media ${expanded ? 'expanded' : ''}`}>
      <div className="store-media-heading">
        <div role="group" aria-label="Categoria da galeria" className="store-gallery-tabs">
          <button
            type="button"
            aria-pressed={category === 'workspace'}
            onClick={() => setCategory('workspace')}
          >
            <Camera size={16} />
            Espaço de trabalho <span>{workspace.length}</span>
          </button>
          <button
            type="button"
            aria-pressed={category === 'portfolio'}
            onClick={() => setCategory('portfolio')}
          >
            <Images size={16} />
            Portfólio <span>{portfolio.length}</span>
          </button>
        </div>
        {!expanded && !!assets.length && (
          <button type="button" className="gallery-expand" onClick={() => onExpand?.(category)}>
            Abrir galeria ↗
          </button>
        )}
      </div>
      {selection.length ? (
        <MediaGallery assets={expanded ? selection : selection.slice(0, 3)} />
      ) : (
        <div className="storefront-cover">
          <Leaf size={46} />
          <span>{businessName}</span>
          <small>
            {category === 'portfolio'
              ? 'Os trabalhos deste espaço aparecerão aqui.'
              : 'As imagens do ambiente aparecerão aqui.'}
          </small>
        </div>
      )}
      {!expanded && selection.length > 3 && (
        <p className="gallery-caption">
          Mais {selection.length - 3} {selection.length - 3 === 1 ? 'registro' : 'registros'} na
          galeria completa.
        </p>
      )}
    </div>
  );
}
