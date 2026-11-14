'use client';
import { ReminderModelsEditor } from '@/modules/workspace/presentation/reminder-models';
import { IdentityInput } from '@/modules/identity/presentation/identity-input';
import { WeeklyHours, hoursFromForm } from '@/modules/shared/presentation/weekly-hours';
import { EmailVerification } from '@/modules/identity/presentation/email-verification';
import {
  Field,
  PageHeading,
  number,
  text,
  type SectionProps,
} from '@/modules/shared/presentation/ui';
import {
  Bell,
  CreditCard,
  Globe,
  Landmark,
  LoaderCircle,
  Save,
  Settings2,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { useState } from 'react';
import {
  BusinessAddressFields,
  addressFromForm,
} from '@/modules/shared/presentation/business-address-fields';
import { MediaEditor, mediaFromForm } from '@/modules/shared/presentation/media-editor';
import { RecommendationPanel } from '@/modules/feedback/presentation/reputation';
import { PaymentsSettings } from './payments-settings';
import { ProfessionalsSettings } from './professionals-settings';
export function SettingsPage(props: SectionProps) {
  const [busy, setBusy] = useState(false);
  const settings = props.data.settings;
  return (
    <>
      <PageHeading
        eyebrow="SEU NEGÓCIO, DO SEU JEITO"
        title="Configurações"
        description="Pequenos ajustes para uma rotina que funciona para você."
      />
      <div className="settings-plans-first"><PaymentsSettings {...props} view="plans" /></div>
      {settings.setupComplete === false && (
        <section className="panel setup-welcome">
          <h2>Vamos preparar sua loja?</h2>
          <p>
            Confira endereço, fotos e horários e salve as configurações. Depois, cadastre os
            serviços e profissionais pelo menu.
          </p>
        </section>
      )}
      <form
        className="settings-layout"
        onSubmit={async (event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          setBusy(true);
          try {
            await props.mutate(
              'settings',
              'PATCH',
              {
                address: addressFromForm(form),
                media: mediaFromForm(form),
                phone: text(form, 'phone'),
                description: text(form, 'description'),
                setupComplete: true,
                name: text(form, 'name'),
                businessName: text(form, 'businessName'),
                timezone: 'America/Sao_Paulo',
                completionMode: text(form, 'completionMode'),
                payOnAppointment: form.has('payOnAppointment'),
                payOnDelivery: form.has('payOnDelivery'),
                bankAccount: text(form, 'bankAccount'),
                pixKey: text(form, 'pixKey'),
                ...hoursFromForm(form),
              },
              'Seu espaço foi atualizado.',
            );
          } catch (e) {
            props.notify(e instanceof Error ? e.message : 'Não foi possível salvar.', true);
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="settings-main">
          <section className="panel settings-panel">
            <div className="settings-section-heading">
              <span className="stat-icon sage">
                <Settings2 size={20} />
              </span>
              <div>
                <h2>Seu espaço</h2>
                <p>Como seu negócio aparece para os clientes.</p>
              </div>
            </div>
            <div className="form-row">
              <Field label="Seu nome">
                <IdentityInput kind="name"
                  name="name"
                  required
                  defaultValue={settings.name}
                />
              </Field>
              <Field label="Nome do negócio">
                <IdentityInput kind="businessName"
                  name="businessName"
                  required
                  defaultValue={settings.businessName}
                />
              </Field>
            </div>
            <Field label="Telefone do estabelecimento">
              <IdentityInput kind="phone"
                name="phone"
                type="tel"
                required
                defaultValue={settings.phone || props.data.user.phone}
              />
            </Field>
            <Field label="Sobre o estabelecimento">
              <textarea
                name="description"
                rows={3}
                maxLength={2000}
                defaultValue={settings.description || ''}
              />
            </Field>
            <BusinessAddressFields initial={settings.address} />
            <p className="form-note">
              Separe as imagens do ambiente em Espaço de trabalho e os resultados dos serviços em
              Portfólio. A primeira imagem de cada grupo será o destaque.
            </p>
            <MediaEditor initial={settings.media} categorize />
          </section>
          <ProfessionalsSettings {...props} />
          <section className="panel settings-panel">
            <div className="settings-section-heading">
              <span className="stat-icon sand">
                <Bell size={20} />
              </span>
              <div>
                <h2>Agenda e rotina</h2>
                <p>Seu tempo tem seu próprio ritmo.</p>
              </div>
            </div>
            <WeeklyHours initial={settings} />
            <Field label="Finalizar atendimentos">
              <select name="completionMode" defaultValue={settings.completionMode}>
                <option value="manual">Manualmente — eu decido quando finalizar</option>
                <option value="automatic">Automaticamente — após o horário estimado</option>
              </select>
            </Field>
            <p className="form-note">
              No modo automático, atendimentos confirmados são finalizados após o horário estimado
              de término. O pagamento continua independente. Horas da semana representam duração
              agendada dos atendimentos concluídos.
            </p>
          </section>
          <section className="panel settings-panel">
            <div className="settings-section-heading">
              <span className="stat-icon lavender">
                <Landmark size={20} />
              </span>
              <div>
                <h2>Recebimentos</h2>
                <p>Preferências de pagamento e informações bancárias.</p>
              </div>
            </div>
            <Field label="Banco e conta">
              <input
                name="bankAccount"
                defaultValue={settings.bankAccount}
                maxLength={100}
                placeholder="Banco, agência e conta"
              />
            </Field>
            <Field label="Chave Pix">
              <input
                name="pixKey"
                defaultValue={settings.pixKey}
                maxLength={100}
                placeholder="CPF, e-mail, telefone ou chave aleatória"
              />
            </Field>
            <label className="setting-switch">
              <div>
                <strong>Pagamento no atendimento</strong>
                <p>Permitir que clientes agendem e paguem no dia.</p>
              </div>
              <input
                type="checkbox"
                name="payOnAppointment"
                defaultChecked={settings.payOnAppointment}
              />
            </label>
            <label className="setting-switch">
              <div>
                <strong>Pagamento na entrega</strong>
                <p>Permitir pedidos de produtos com pagamento na entrega.</p>
              </div>
              <input type="checkbox" name="payOnDelivery" defaultChecked={settings.payOnDelivery} />
            </label>
          </section>
          <div className="settings-save">
            <span>
              <ShieldCheck size={15} />
              As alterações valem para novas solicitações.
            </span>
            <button className="button primary" disabled={busy}>
              {busy ? <LoaderCircle size={17} className="spin" /> : <Save size={17} />}Salvar
              configurações
            </button>
          </div>
        </div>
        <aside className="settings-aside">
          <RecommendationPanel revision={props.revision} />
          <EmailVerification verified={props.data.user.emailVerified} />
          <section className="panel integration-card">
            <span className="stat-icon sage">
              <Smartphone size={23} />
            </span>
            <h3>Contato pelo WhatsApp</h3>
            <span className="integration-status">Conversa manual</span>
            <p>
              Abra a conversa pelo telefone do cliente na ficha ou no atendimento.
              Você confere e envia a mensagem no WhatsApp, sem integração ou envio automático.
            </p>
          </section>
          <div className="info-note">
            <Globe size={19} />
            <p>
              Todos os horários seguem Brasília. O calendário exibe de segunda a domingo; os
              indicadores semanais contabilizam de domingo a sábado.
            </p>
          </div>
        </aside>
      </form>
      <ReminderModelsEditor {...props} />
      <div className="settings-payments"><PaymentsSettings {...props} /></div>
    </>
  );
}
