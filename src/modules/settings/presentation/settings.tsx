'use client';
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
                name: text(form, 'name'),
                businessName: text(form, 'businessName'),
                timezone: 'America/Sao_Paulo',
                completionMode: text(form, 'completionMode'),
                payOnAppointment: form.has('payOnAppointment'),
                payOnDelivery: form.has('payOnDelivery'),
                bankAccount: text(form, 'bankAccount'),
                pixKey: text(form, 'pixKey'),
                openingHour: number(form, 'openingHour'),
                closingHour: number(form, 'closingHour'),
                workDays: form.getAll('workDays').map(Number),
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
                <input
                  name="name"
                  required
                  defaultValue={settings.name}
                  minLength={2}
                  maxLength={100}
                />
              </Field>
              <Field label="Nome do negócio">
                <input
                  name="businessName"
                  required
                  defaultValue={settings.businessName}
                  minLength={2}
                  maxLength={100}
                />
              </Field>
            </div>
            <Field label="Código da loja" hint="Compartilhe esse código com seus clientes.">
              <input readOnly value={settings.slug} />
            </Field>
          </section>
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
            <div className="form-row">
              <Field label="Abertura (hora)">
                <input
                  type="number"
                  name="openingHour"
                  defaultValue={settings.openingHour}
                  min={0}
                  max={23}
                  required
                />
              </Field>
              <Field label="Fechamento (hora)">
                <input
                  type="number"
                  name="closingHour"
                  defaultValue={settings.closingHour}
                  min={1}
                  max={24}
                  required
                />
              </Field>
            </div>
            <Field label="Dias de atendimento">
              <div className="weekday-options">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((name, index) => (
                  <label key={name}>
                    <input
                      type="checkbox"
                      name="workDays"
                      value={index}
                      defaultChecked={settings.workDays.includes(index)}
                    />
                    <span>{name}</span>
                  </label>
                ))}
              </div>
            </Field>
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
          <section className="panel integration-card">
            <span className="stat-icon sage">
              <CreditCard size={23} />
            </span>
            <h3>Pagamentos online</h3>
            <span className="integration-status">Etapa futura</span>
            <p>
              O botão de pagar pela plataforma ficará oculto até configurar e validar o gateway,
              além dos dados bancários e Pix.
            </p>
          </section>
          <section className="panel integration-card">
            <span className="stat-icon sage">
              <Smartphone size={23} />
            </span>
            <h3>WhatsApp Business</h3>
            <span className="integration-status">Etapa futura</span>
            <p>
              Os envios automáticos serão habilitados após a validação da Meta. Por enquanto, você
              pode abrir conversas e enviar mensagens manualmente.
            </p>
          </section>
          <div className="info-note">
            <Globe size={19} />
            <p>
              Todos os horários seguem Brasília. Sua semana começa no domingo e termina no sábado.
            </p>
          </div>
        </aside>
      </form>
    </>
  );
}
