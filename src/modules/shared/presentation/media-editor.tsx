'use client';
import { workspaceRequestHeaders } from '../infrastructure/api';
import { useState } from 'react';
import type { MediaAsset } from '../domain/models';
export function MediaGallery({ assets }: { assets: MediaAsset[] }) {
  return (
    <div className="media-gallery">
      {assets.map((asset, index) =>
        asset.type === 'video' ? (
          <video
            key={`${asset.url}-${index}`}
            src={asset.url}
            controls
            preload="metadata"
            aria-label={asset.alt || 'Vídeo do estabelecimento'}
          />
        ) : (
          <a key={`${asset.url}-${index}`} href={asset.url} target="_blank" rel="noreferrer">
            <img src={asset.url} alt={asset.alt || 'Foto do estabelecimento'} loading="lazy" />
          </a>
        ),
      )}
    </div>
  );
}
export function MediaEditor({
  initial = [],
  limit = 12,
  categorize = false,
}: {
  initial?: MediaAsset[];
  limit?: number;
  categorize?: boolean;
}) {
  const [assets, setAssets] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return (
    <div className="media-editor">
      <input type="hidden" name="media" value={JSON.stringify(assets)} />
      <label className="media-upload">
        <strong>Fotos e vídeos</strong>
        <span className="media-upload-title">Adicionar foto ou vídeo</span>
        <span className="media-upload-caption">Selecione um arquivo do seu dispositivo</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
          disabled={busy || assets.length >= limit}
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            event.target.value = '';
            if (file.size > (file.type.startsWith('image/') ? 5 : 12) * 1024 * 1024) {
              setError('Use fotos de até 5 MB ou vídeos de até 12 MB.');
              return;
            }
            setBusy(true);
            setError('');
            try {
              const body = new FormData();
              body.set('file', file);
              const response = await fetch('/api/media', { method: 'POST', headers:workspaceRequestHeaders(), body });
              const result = await response.json();
              if (!response.ok) throw new Error(result.message || 'Falha no envio.');
              setAssets((current) => [
                ...current,
                {
                  ...result,
                  alt: file.name.slice(0, 150),
                  ...(categorize ? { category: 'workspace' } : {}),
                },
              ]);
            } catch (cause) {
              setError(cause instanceof Error ? cause.message : 'Falha no envio.');
            } finally {
              setBusy(false);
            }
          }}
        />
      </label>
      <p className="form-note">
        {busy
          ? 'Enviando arquivo… Aguarde antes de salvar.'
          : `Até ${limit} arquivos. Fotos JPG/PNG/WebP (5 MB), vídeos MP4/WebM (12 MB). Salve para publicar a seleção.`}
      </p>
      <input type="hidden" name="mediaUploading" value={String(busy)} />
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      {assets.map((asset, index) => (
        <div key={`${asset.url}-${index}`} className="media-editor-item">
          <MediaGallery assets={[asset]} />
          {categorize && (
            <label>
              Exibir em
              <select
                value={asset.category || 'workspace'}
                onChange={(event) =>
                  setAssets((current) =>
                    current.map((value, position) =>
                      position === index
                        ? { ...value, category: event.target.value as 'workspace' | 'portfolio' }
                        : value,
                    ),
                  )
                }
              >
                <option value="workspace">Espaço de trabalho</option>
                <option value="portfolio">Portfólio</option>
              </select>
            </label>
          )}
          {categorize && index > 0 && (
            <button
              type="button"
              className="button secondary small"
              onClick={() =>
                setAssets((current) => [
                  current[index],
                  ...current.filter((_, position) => position !== index),
                ])
              }
            >
              Mover para o início
            </button>
          )}
          <label>
            Descrição da mídia
            <input
              value={asset.alt}
              maxLength={150}
              onChange={(event) =>
                setAssets((current) =>
                  current.map((value, position) =>
                    position === index ? { ...value, alt: event.target.value } : value,
                  ),
                )
              }
            />
          </label>
          <button
            type="button"
            className="button secondary small"
            onClick={() =>
              setAssets((current) => current.filter((_, position) => position !== index))
            }
          >
            Retirar da galeria
          </button>
        </div>
      ))}
    </div>
  );
}
export function mediaFromForm(form: FormData): MediaAsset[] {
  if (form.get('mediaUploading') === 'true')
    throw new Error('Aguarde o envio do arquivo antes de salvar.');
  return JSON.parse(String(form.get('media') || '[]'));
}
