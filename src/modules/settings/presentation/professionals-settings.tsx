'use client';
import { ExtraEmployeeControls, type PlanStatus } from './store-plans';
import { WeeklyHours, hoursFromForm } from '@/modules/shared/presentation/weekly-hours';
import { ScheduleExceptions } from './schedule-exceptions';
import type { Professional } from '@/modules/shared/domain/models';
import {
  AddButton,
  Field,
  ResourceState,
  useResource,
  text,
  number,
  type SectionProps,
} from '@/modules/shared/presentation/ui';
export function ProfessionalsSettings(props: SectionProps) {
  const resource = useResource<Professional[]>('professionals', props.revision);
  const billing = useResource<PlanStatus>('payments/status', props.revision);
  function edit(professional?: Professional) {
    const settings = props.data.settings;
    props.openDialog({
      title: professional ? 'Editar profissional' : 'Novo profissional',
      description:
        'Defina os serviços e o expediente. Este cadastro não cria um acesso de administrador.',
      content: (
        <div className="form-grid">
          <Field label="Nome">
            <input
              name="name"
              required
              minLength={2}
              maxLength={100}
              defaultValue={professional?.name}
            />
          </Field>
          <Field label="Serviços" hint="Sem seleção, atende todos os serviços da loja.">
            {props.data.catalog
              .filter((item) => item.kind === 'service')
              .map((item) => (
                <label key={item.id} className="checkbox-field">
                  <input
                    type="checkbox"
                    name="serviceIds"
                    value={item.id}
                    defaultChecked={professional?.serviceIds.includes(item.id)}
                  />
                  {item.name}
                </label>
              ))}
          </Field>
          <WeeklyHours initial={professional || settings} />
          <ScheduleExceptions professional={professional} />
          <label className="checkbox-field">
            <input type="checkbox" name="active" defaultChecked={professional?.active ?? true} />
            Disponível para novos agendamentos
          </label>
        </div>
      ),
      submitLabel: 'Salvar profissional',
      onSubmit: async (form) => {
        await props.mutate(
          professional ? `professionals/${professional.id}` : 'professionals',
          professional ? 'PATCH' : 'POST',
          {
            breaks: JSON.parse(text(form, 'breaks') || '[]'),
            daysOff: JSON.parse(text(form, 'daysOff') || '[]'),
            name: text(form, 'name'),
            active: form.has('active'),
            serviceIds: form.getAll('serviceIds').map(String),
            ...hoursFromForm(form),
          },
          'Profissional atualizado.',
        );
      },
    });
  }
  return (
    <section className="panel settings-panel">
      <div className="panel-heading">
        <h2>Profissionais e agendas</h2>
        <AddButton onClick={() => edit()}>Adicionar</AddButton>
      </div>
      <p>Cada profissional tem sua agenda. Cadastros antigos ficam na agenda principal.</p>
      {billing.value && <ExtraEmployeeControls status={billing.value} props={props} />}
      <ResourceState {...resource} />
      {resource.value?.map((p) => (
        <div className="order-line" key={p.id}>
          <strong>{p.name}</strong>
          <span>{p.active ? 'Ativo' : 'Inativo'}</span>
          <button type="button" className="button secondary small" onClick={() => edit(p)}>
            Editar
          </button>
        </div>
      ))}
    </section>
  );
}
