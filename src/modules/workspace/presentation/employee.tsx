'use client';
import { ClientCarePage } from './client-care';
import { WorkspaceTools } from './workspace-tools';
import { WorkspaceAppearance } from './agenda-preferences';
import { useState } from 'react';
import { Bell, CalendarDays, Clock3, LogOut } from 'lucide-react';
import { EmailVerification } from '@/modules/identity/presentation/email-verification';
import type { Professional } from '@/modules/shared/domain/models';
import {
  Field,
  Dialog,
  useResource,
  ResourceState,
  type DialogState,
  type SectionProps,
} from '@/modules/shared/presentation/ui';
import { Brand } from '@/modules/shared/presentation/brand';
import { WeeklyHours, hoursFromForm } from '@/modules/shared/presentation/weekly-hours';
import { ScheduleExceptions } from '@/modules/settings/presentation/schedule-exceptions';
import { CalendarPage } from '@/modules/appointments/presentation/calendar-page';
export function EmployeeWorkspace(props: SectionProps & { logout: () => Promise<void> }) {
  const [tab, setTab] = useState('agenda'),
    [dialog, setDialog] = useState<DialogState>(),
    [message, setMessage] = useState('');
  const resource = useResource<Professional[]>('professionals', props.revision),
    profile = resource.value?.find((item) => item.id === props.data.user.professionalId);
  const navigation = [
    { id: 'tools', name: 'Fichas e análises', icon: CalendarDays },
    { id: 'care', name: 'Acompanhamento', icon: CalendarDays },
    { id: 'agenda', name: 'Minha agenda', icon: CalendarDays },
    { id: 'horarios', name: 'Meus horários', icon: Clock3 },
    { id: 'avisos', name: 'Notificações', icon: Bell },
  ];
  const nav = (mobile = false) => (
    <nav
      className={mobile ? 'staff-mobile-navigation' : 'staff-side-navigation'}
      aria-label={mobile ? 'Navegação móvel' : 'Área do funcionário'}
    >
      {navigation.map(({ id, name, icon: Icon }) => (
        <button key={id} aria-current={tab === id ? 'page' : undefined} onClick={() => setTab(id)}>
          <Icon size={18} />
          <span>{name}</span>
        </button>
      ))}
    </nav>
  );
  return (
    <div className="employee-shell">
      <aside className="employee-sidebar">
        <a className="brand" href="/">
          <Brand />
        </a>
        <div className="staff-user">
          <strong>{props.data.user.name}</strong>
          <small>{props.data.settings.businessName} · Funcionário</small>
        </div>
        {nav()}
        <button className="button secondary" onClick={props.logout}>
          <LogOut size={16} /> Sair
        </button>
      </aside>
      <div className="employee-work">
        <header className="employee-topbar">
          <a className="brand employee-mobile-brand" href="/">
            <Brand />
          </a>
          <div className="staff-user">
            <strong>{props.data.user.name}</strong>
            <small>{props.data.settings.businessName}</small>
          </div>
          <div className="employee-header-actions">
            <button
              className="icon-button"
              aria-label="Abrir notificações"
              onClick={() => setTab('avisos')}
            >
              <Bell size={19} />
            </button>
            <button
              className="icon-button employee-mobile-brand"
              aria-label="Sair da conta"
              onClick={props.logout}
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>
        <main className="employee-content"><WorkspaceAppearance revision={props.revision} />
          {tab.startsWith('care') && <ClientCarePage key={tab} initialTab={tab==='care-wait'?'wait':'returns'} {...props} openDialog={setDialog} navigate={next=>setTab(next.startsWith('care')?next:'tools')} />}
          {tab === 'tools' && <WorkspaceTools {...props} openDialog={setDialog} navigate={()=>setTab('tools')} />}
          {message && <p role="status">{message}</p>}
          {tab === 'agenda' && <CalendarPage {...props} openDialog={setDialog} navigate={next=>{setDialog(undefined);setTab(next.startsWith('care')?next:'tools');}} />}
          {tab === 'horarios' && (
            <>
              <EmailVerification verified={props.data.user.emailVerified} />
              <div className="page-heading">
                <div>
                  <h1>Meus horários</h1>
                  <p>Sua disponibilidade no {props.data.settings.businessName}.</p>
                </div>
              </div>
              <ResourceState {...resource} />
              {profile && (
                <form
                  className="panel employee-hours-form"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    const form = new FormData(event.currentTarget);
                    try {
                      await props.mutate(
                        `professionals/${profile.id}`,
                        'PATCH',
                        {
                          ...hoursFromForm(form),
                          breaks: JSON.parse(String(form.get('breaks'))),
                          daysOff: JSON.parse(String(form.get('daysOff'))),
                        },
                        'Disponibilidade atualizada.',
                      );
                      setMessage('Disponibilidade atualizada.');
                    } catch (error) {
                      setMessage((error as Error).message);
                    }
                  }}
                >
                  <WeeklyHours initial={profile} store={props.data.settings} />
                  <ScheduleExceptions professional={profile} />
                  <button className="button primary">Salvar meus horários</button>
                </form>
              )}
            </>
          )}
          {tab === 'avisos' && (
            <>
              <h1>Minhas notificações</h1>
              {props.data.notifications.map((notification) => (
                <article className="panel employee-appointment" key={notification.id}>
                  <h2>{notification.title}</h2>
                  <p>{notification.message}</p>
                  {!notification.read && (
                    <button
                      className="button secondary"
                      onClick={() =>
                        props
                          .mutate(
                            `notifications/${notification.id}`,
                            'PATCH',
                            {},
                            'Notificação lida.',
                          )
                          .catch((error) => setMessage(error.message))
                      }
                    >
                      Marcar como lida
                    </button>
                  )}
                </article>
              ))}
              {!props.data.notifications.length && <p>Tudo em dia.</p>}
            </>
          )}
        </main>
        {nav(true)}
      </div>
      {dialog && <Dialog key={dialog.title} dialog={dialog} close={() => setDialog(undefined)} />}
    </div>
  );
}
