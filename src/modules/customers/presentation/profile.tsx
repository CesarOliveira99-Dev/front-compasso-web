'use client';
import { IdentityInput } from '@/modules/identity/presentation/identity-input';
import {EmailVerification} from '@/modules/identity/presentation/email-verification';
import type { Customer } from '@/modules/shared/domain/models';
import {
  Avatar,
  Badge,
  Field,
  PageHeading,
  ResourceState,
  text,
  useResource,
  type SectionProps,
} from '@/modules/shared/presentation/ui';
import { MapPin, Plus, Save } from 'lucide-react';
import { GoogleButton } from '@/modules/identity/presentation/google-button';
export function ProfilePage(props: SectionProps) {
  const resource = useResource<Customer>('customers/profile', props.revision);
  const customer = resource.value;
  function address() {
    props.openDialog({
      title: 'Um novo endereço',
      description: 'Para seus produtos chegarem até você.',
      content: (
        <div className="form-grid">
          <Field label="Nome do endereço">
            <input name="label" required maxLength={50} placeholder="Casa, trabalho…" />
          </Field>
          <div className="form-row">
            <Field label="CEP">
              <input
                name="postalCode"
                required
                minLength={8}
                maxLength={10}
                placeholder="00000-000"
              />
            </Field>
            <Field label="Cidade">
              <input name="city" required minLength={2} maxLength={100} />
            </Field>
          </div>
          <div className="form-row">
            <Field label="Rua e complemento">
              <input name="street" required minLength={3} maxLength={150} />
            </Field>
            <Field label="Número">
              <input name="number" required maxLength={20} />
            </Field>
          </div>
          <label className="checkbox-field">
            <input type="checkbox" name="isDefault" />
            Definir como endereço padrão
          </label>
        </div>
      ),
      submitLabel: 'Cadastrar endereço',
      onSubmit: async (form) => {
        await props.mutate(
          'customers/addresses',
          'POST',
          {
            label: text(form, 'label'),
            postalCode: text(form, 'postalCode'),
            city: text(form, 'city'),
            street: text(form, 'street'),
            number: text(form, 'number'),
            isDefault: form.has('isDefault'),
          },
          'Endereço cadastrado.',
        );
      },
    });
  }
  return (
    <>
      <EmailVerification verified={props.data.user.emailVerified}/>
      <PageHeading
        eyebrow="SEU ESPAÇO PESSOAL"
        title="Meus dados"
        description="Mantenha suas informações em dia para a gente cuidar bem de você."
      />
      <ResourceState {...resource} />
      <section className="panel settings-panel">
        <h3>Acesso com Google</h3>
        <p>
          Vincule uma conta Google com o mesmo e-mail do seu cadastro para entrar sem digitar a
          senha.
        </p>
        <GoogleButton
          link
          getInput={() => ({ mode: 'link', slug: props.data.settings.slug })}
          onSuccess={async () => {
            props.notify('Conta Google vinculada.');
          }}
          onError={(message) => props.notify(message, true)}
        />
      </section>
      {customer && (
        <div className="profile-layout">
          <section className="panel settings-panel">
            <div className="profile-heading">
              <Avatar name={customer.name} size="large" />
              <div>
                <h2>{customer.name}</h2>
              </div>
            </div>
            <form
              className="form-grid"
              onSubmit={async (event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                try {
                  await props.mutate(
                    'customers/profile',
                    'PATCH',
                    { name: text(form, 'name'), phone: text(form, 'phone') },
                    'Seus dados foram atualizados.',
                  );
                } catch (e) {
                  props.notify(e instanceof Error ? e.message : 'Erro ao salvar.', true);
                }
              }}
            >
              <Field label="Nome">
                <IdentityInput kind="name"
                  name="name"
                  defaultValue={customer.name}
                  required
                />
              </Field>
              <Field label="Telefone">
                <IdentityInput kind="phone"
                  name="phone"
                  defaultValue={customer.phone}
                  required
                />
              </Field>
              <Field label="E-mail">
                <input readOnly value={customer.email} />
              </Field>
              <button className="button primary">
                <Save size={16} />
                Salvar meus dados
              </button>
            </form>
          </section>
          <section className="panel settings-panel">
            <div className="panel-heading">
              <h2>Meus endereços</h2>
              <button className="text-button" onClick={address}>
                <Plus size={16} />
                Novo endereço
              </button>
            </div>
            <div className="addresses-list">
              {customer.addresses.map((a) => (
                <article className="address-card" key={a.id}>
                  <MapPin size={20} />
                  <div>
                    <strong>{a.label}</strong>
                    <p>
                      {a.street}, {a.number}
                    </p>
                    <p>
                      {a.city} • {a.postalCode}
                    </p>
                    {a.isDefault ? (
                      <Badge status="active">Padrão</Badge>
                    ) : (
                      <button
                        className="text-button"
                        onClick={() =>
                          props
                            .mutate(
                              `customers/addresses/${a.id}/default`,
                              'PATCH',
                              {},
                              'Endereço padrão atualizado.',
                            )
                            .catch((e) => props.notify(e.message, true))
                        }
                      >
                        Definir como padrão
                      </button>
                    )}
                  </div>
                </article>
              ))}
              {!customer.addresses.length && (
                <div className="empty-state">
                  <MapPin size={27} />
                  <h3>Para onde vai seu próximo cuidado?</h3>
                  <p>Cadastre um endereço para receber produtos.</p>
                  <button className="button secondary" onClick={address}>
                    Cadastrar endereço
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
