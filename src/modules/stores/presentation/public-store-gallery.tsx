'use client';
import { useState } from 'react';
import { Camera, Images, Leaf, Play } from 'lucide-react';
import type { MediaAsset } from '@/modules/shared/domain/models';
import { Dialog } from '@/modules/shared/presentation/ui';
import { MediaGallery } from '@/modules/shared/presentation/media-editor';
export function PublicStoreGallery({ assets, name }: { assets: MediaAsset[]; name: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div
        className={`venue-gallery venue-gallery-count-${Math.min(assets.length, 3)} ${assets.length ? '' : 'venue-gallery-empty'}`}
      >
        {assets.length ? (
          assets.slice(0, 3).map((asset, index) => (
            <button
              className={`venue-photo venue-photo-${index}`}
              key={`${asset.url}-${index}`}
              onClick={() => setOpen(true)}
              aria-label={`Abrir galeria de ${name}: ${asset.alt || `imagem ${index + 1}`}`}
            >
              {asset.type === 'video' ? (
                <>
                  <video src={asset.url} preload="metadata" muted aria-hidden="true" />
                  <span className="venue-play">
                    <Play size={24} />
                  </span>
                </>
              ) : (
                <img src={asset.url} alt={asset.alt || name} />
              )}
            </button>
          ))
        ) : (
          <div className="venue-cover-art">
            <Leaf size={68} strokeWidth={1} />
            <span>SEU TEMPO. SEU CUIDADO.</span>
            <strong>
              Um espaço para
              <br />
              se sentir bem.
            </strong>
            <small>{name}</small>
          </div>
        )}
        {assets.length > 0 && (
          <button className="venue-gallery-trigger" onClick={() => setOpen(true)}>
            <Images size={16} /> Ver galeria <span>{assets.length}</span>
          </button>
        )}
        {!assets.length && (
          <span className="venue-gallery-note">
            <Camera size={15} /> Conheça o espaço pelo perfil
          </span>
        )}
      </div>
      {open && (
        <Dialog
          close={() => setOpen(false)}
          dialog={{
            title: `Conheça ${name}`,
            description: 'Ambiente e trabalhos do estabelecimento.',
            content: <MediaGallery assets={assets} />,
          }}
        />
      )}
    </>
  );
}
