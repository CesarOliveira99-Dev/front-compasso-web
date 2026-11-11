'use client';
import dynamic from 'next/dynamic';
import { EmployeeWorkspace } from './employee';
import { TeamPage } from '@/modules/settings/presentation/team';
import { StoreTrialBanner } from '@/modules/settings/presentation/store-trial-banner';
import { Discovery } from '@/modules/stores/presentation/discovery';
import { CustomerLobby } from './customer-lobby';
function LoadingSection() {
  return <div className="loading-inline">Preparando seu espaço…</div>;
}
const AppointmentsPage = dynamic(
  () =>
    import('@/modules/appointments/presentation/appointments').then(
      (module) => module.AppointmentsPage,
    ),
  { loading: LoadingSection },
);
const CatalogPage = dynamic(
  () => import('@/modules/catalog/presentation/catalog').then((module) => module.CatalogPage),
  { loading: LoadingSection },
);
const CartPage = dynamic(
  () => import('@/modules/checkout/presentation/cart').then((module) => module.CartPage),
  { loading: LoadingSection },
);
const OrdersPage = dynamic(
  () => import('@/modules/checkout/presentation/orders').then((module) => module.OrdersPage),
  { loading: LoadingSection },
);
const CustomersPage = dynamic(
  () => import('@/modules/customers/presentation/customers').then((module) => module.CustomersPage),
  { loading: LoadingSection },
);
const ProfilePage = dynamic(
  () => import('@/modules/customers/presentation/profile').then((module) => module.ProfilePage),
  { loading: LoadingSection },
);
import { CalendarPage } from '@/modules/appointments/presentation/calendar-page';
import { Brand } from '@/modules/shared/presentation/brand';
import { CustomerHeader } from './customer-header';
import { CustomerHome } from '@/modules/dashboard/presentation/customer-home';
import { openBooking } from '@/modules/appointments/presentation/booking-dialog';
const FeedbackPage = dynamic(
  () => import('@/modules/feedback/presentation/feedback').then((module) => module.FeedbackPage),
  { loading: LoadingSection },
);
import { Login } from '@/modules/identity/presentation/login';
const LoyaltyPage = dynamic(
  () => import('@/modules/loyalty/presentation/loyalty').then((module) => module.LoyaltyPage),
  { loading: LoadingSection },
);
const ProcurementPage = dynamic(
  () =>
    import('@/modules/procurement/presentation/procurement').then(
      (module) => module.ProcurementPage,
    ),
  { loading: LoadingSection },
);
const PromotionsPage = dynamic(
  () =>
    import('@/modules/promotions/presentation/promotions').then((module) => module.PromotionsPage),
  { loading: LoadingSection },
);
const ReportsPage = dynamic(
  () => import('@/modules/reports/presentation/reports').then((module) => module.ReportsPage),
  { loading: LoadingSection },
);
const SettingsPage = dynamic(
  () => import('@/modules/settings/presentation/settings').then((module) => module.SettingsPage),
  { loading: LoadingSection },
);
import { day, time } from '@/modules/shared/domain/format';
import type { Bootstrap, CartLine, User } from '@/modules/shared/domain/models';
import { api } from '@/modules/shared/infrastructure/api';
import {
  Avatar,
  Dialog,
  type DialogState,
  type Mutate,
  type SectionProps,
} from '@/modules/shared/presentation/ui';
const TriagePage = dynamic(
  () => import('@/modules/triage/presentation/triage').then((module) => module.TriagePage),
  { loading: LoadingSection },
);
const WalletPage = dynamic(
  () => import('@/modules/wallet/presentation/wallet').then((module) => module.WalletPage),
  { loading: LoadingSection },
);
import {
  Bell,
  CalendarDays,
  ChartNoAxesCombined,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Flower2,
  Gift,
  LayoutDashboard,
  Leaf,
  LoaderCircle,
  LogOut,
  Menu,
  MessageCircle,
  Package,
  Search,
  Settings,
  ShoppingBag,
  Sparkles,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
const adminNavigation = [
  {
    label: 'SEU DIA A DIA',
    items: [
      { id: 'home', name: 'Calendário', icon: CalendarDays },
      { id: 'appointments', name: 'Histórico de atendimentos', icon: ClipboardList },
      { id: 'customers', name: 'Clientes', icon: Users },
      { id: 'team', name: 'Equipe', icon: Users },
      { id: 'triage', name: 'Triagem', icon: ClipboardList },
      { id: 'feedback', name: 'Avaliações', icon: MessageCircle },
    ],
  },
  {
    label: 'SEU NEGÓCIO',
    items: [
      { id: 'catalog', name: 'Serviços e produtos', icon: Package },
      { id: 'orders', name: 'Pedidos e vendas', icon: ShoppingBag },
      { id: 'wallet', name: 'Finanças', icon: Wallet },
      { id: 'promotions', name: 'Cupons e promoções', icon: Gift },
      { id: 'loyalty', name: 'Retornos e fidelidade', icon: Flower2 },
      { id: 'reports', name: 'Relatórios', icon: ChartNoAxesCombined },
      { id: 'procurement', name: 'Minhas compras', icon: Search },
    ],
  },
];
const customerNavigation = [
  {
    label: 'SEU ESPAÇO',
    items: [
      { id: 'discovery', name: 'Descobrir lojas', icon: Search },
      { id: 'home', name: 'Menu Principal', icon: LayoutDashboard },
      { id: 'catalog', name: 'Serviços e produtos', icon: Package },
      { id: 'appointments', name: 'Meus agendamentos', icon: CalendarDays },
      { id: 'orders', name: 'Meus pedidos', icon: ShoppingBag },
      { id: 'loyalty', name: 'Meus próximos cuidados', icon: Flower2 },
      { id: 'feedback', name: 'Minhas avaliações', icon: MessageCircle },
      { id: 'profile', name: 'Meus dados', icon: Users },
    ],
  },
];
export function Workspace() {
  const loadedUser = useRef('');
  const repeatedBooking = useRef(false);
  const [data, setData] = useState<Bootstrap>();
  const [personalUser, setPersonalUser] = useState<User>();
  const [loading, setLoading] = useState(true);
  const [fatal, setFatal] = useState('');
  const [page, setPage] = useState('home');
  const [revision, setRevision] = useState(0);
  const [dialog, setDialog] = useState<DialogState & { key: number }>();
  const [toast, setToast] = useState<{ message: string; error: boolean }>();
  const [mobile, setMobile] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [cart, setCartState] = useState<CartLine[]>([]);
  const notify = useCallback((message: string, error = false) => setToast({ message, error }), []);
  const load = useCallback(async () => {
    try {
      const value = await api<Bootstrap | {status:'discovery'; user:User}>('bootstrap');
      if ('status' in value && value.status === 'discovery') {
        setPersonalUser(value.user);
        setData(undefined);
        setFatal('');
        return;
      }
      if ('status' in value) return;
      setPersonalUser(undefined);
      if (loadedUser.current !== value.user.id) {
        setPage(
          value.user.role === 'admin' && value.settings.setupComplete === false
            ? 'settings'
            : value.user.role === 'customer'
              ? new URLSearchParams(location.search).has('agendar')
                ? 'catalog'
                : 'home'
              : 'home',
        );
        loadedUser.current = value.user.id;
      }
      setData(value);
      setFatal('');
      return value;
    } catch (error) {
      if (error instanceof Error && /Entre para continuar/.test(error.message)) {
        setData(undefined);
        setPersonalUser(undefined);
      } else setFatal(error instanceof Error ? error.message : 'Não foi possível carregar.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    const refresh = () => { if (document.visibilityState === 'visible') void load(); };
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [load]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(undefined), 5500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (!data) return;
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') void load();
    }, 60000);
    return () => clearInterval(timer);
  }, [data?.user.id, load]);
  useEffect(() => {
    if (!data?.user.id) return;
    try {
      setCartState(JSON.parse(localStorage.getItem(`compasso:cart:${data.user.id}`) || '[]'));
    } catch {
      setCartState([]);
      setMobile(false);
      setNotifications(false);
    }
  }, [data?.user.id]);
  function setCart(value: CartLine[]) {
    setCartState(value);
    if (data) localStorage.setItem(`compasso:cart:${data.user.id}`, JSON.stringify(value));
  }
  const mutate: Mutate = async (path, method, body, message) => {
    const result = await api(path, method, body);
    await load();
    setRevision((v) => v + 1);
    notify(message);
    return result as never;
  };
  function navigate(next: string) {
    setPage(next);
    setMobile(false);
    setNotifications(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  const openDialog = (value: DialogState) => setDialog({ ...value, key: Date.now() });
  async function logout() {
    try {
      await api('auth/logout', 'POST', {});
      setData(undefined);
      loadedUser.current = '';
      setCartState([]);
      setPage('home');
      setMobile(false);
      setNotifications(false);
      setDialog(undefined);
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Não foi possível sair.', true);
    }
  }
  function search() {
    if (!data) return;
    openDialog({
      title: 'Encontre seu próximo passo',
      description: 'Busque serviços, produtos e agendamentos.',
      content: (
        <SearchDialog
          data={data}
          go={(next) => {
            setDialog(undefined);
            navigate(next);
          }}
        />
      ),
    });
  }
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        search();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  });
  useEffect(() => {
    const itemId = new URLSearchParams(location.search).get('repetir');
    if (!itemId || !data || data.user.role !== 'customer' || repeatedBooking.current) return;
    repeatedBooking.current = true;
    history.replaceState(null, '', location.pathname);
    void openBooking({ data, revision, mutate, notify, openDialog, navigate }, itemId)
      .catch((error) => notify(error.message, true));
  }, [data]);
  if (loading)
    return (
      <div className="app-loading">
        <Brand />
        <LoaderCircle size={20} className="spin" />
        <p>Organizando seu espaço…</p>
      </div>
    );
  if (personalUser) return <CustomerLobby user={personalUser} />;
  if (!data)
    return (
      <>
        {fatal && (
          <div className="connection-error" role="alert">
            {fatal}
            <button onClick={() => load()}>Tentar novamente</button>
          </div>
        )}
        <Login
          onLogin={async () => {
            const slug = new URLSearchParams(location.search).get('loja');
            if (slug) {
              location.assign(`/loja?slug=${encodeURIComponent(slug)}`);
              return;
            }
            await load();
          }}
        />
      </>
    );
  const admin = data.user.role === 'admin';
  const navigation = admin ? adminNavigation : customerNavigation;
  const currentLabel =
    navigation.flatMap((g) => g.items).find((i) => i.id === page)?.name ||
    (page === 'settings' ? 'Configurações' : page === 'cart' ? 'Sua sacola' : 'Visão geral');
  const unread = data.notifications.filter((n) => !n.read).length;
  const props: SectionProps = { data, revision, mutate, notify, openDialog, navigate };
  if (data.user.role === 'employee') return <EmployeeWorkspace {...props} logout={logout} />;
  let content;
  switch (page) {
    case 'team':
      content = admin ? <TeamPage {...props} /> : <Discovery />;
      break;
    case 'discovery':
      content = <Discovery />;
      break;
    case 'appointments':
      content = <AppointmentsPage {...props} />;
      break;
    case 'customers':
      content = <CustomersPage {...props} />;
      break;
    case 'catalog':
      content = (
        <CatalogPage
          {...props}
          addToCart={(line) => {
            setCart([...cart, line]);
            notify('Adicionado à sua sacola.');
          }}
        />
      );
      break;
    case 'triage':
      content = <TriagePage {...props} />;
      break;
    case 'feedback':
      content = <FeedbackPage {...props} />;
      break;
    case 'orders':
      content = <OrdersPage {...props} />;
      break;
    case 'wallet':
      content = <WalletPage {...props} />;
      break;
    case 'promotions':
      content = <PromotionsPage {...props} />;
      break;
    case 'loyalty':
      content = <LoyaltyPage {...props} />;
      break;
    case 'reports':
      content = <ReportsPage {...props} />;
      break;
    case 'settings':
      content = <SettingsPage {...props} />;
      break;
    case 'profile':
      content = <ProfilePage {...props} />;
      break;
    case 'procurement':
      content = <ProcurementPage {...props} />;
      break;
    case 'cart':
      content = <CartPage {...props} cart={cart} setCart={setCart} />;
      break;
    default:
      content = admin ? <CalendarPage {...props} /> : <CustomerHome {...props} />;
  }
  return (
    <div className={`app-shell ${admin ? 'admin-shell' : 'customer-shell'}`}>
      {mobile && (
        <button
          className="sidebar-scrim"
          aria-label="Fechar menu"
          onClick={() => setMobile(false)}
        />
      )}
      <aside className={`sidebar ${mobile ? 'open' : ''}`}>
        <a
          className="brand"
          href="/"
          aria-label="Compasso, início"
          onClick={(event) => {
            event.preventDefault();
            navigate('home');
          }}
        >
          <Brand />
        </a>
        <div className="business-switch">
          <span className="business-icon">
            <Flower2 size={22} />
          </span>
          <div>
            <strong>{admin ? data.settings.businessName : 'Compasso'}</strong>
            <small>{admin ? 'Seu espaço de cuidado' : 'Seu cuidado por perto'}</small>
          </div>
          <span className="store-indicator" />
        </div>
        <nav aria-label="Navegação principal">
          {navigation.map((group) => (
            <div className="nav-group" key={group.label}>
              <span className="nav-label">{group.label}</span>
              {group.items.map((item) => (
                <button
                  key={item.id}
                  className={`nav-item ${page === item.id ? 'active' : ''}`}
                  aria-current={page === item.id ? 'page' : undefined}
                  title={item.name}
                  aria-label={item.name}
                  onClick={() => navigate(item.id)}
                >
                  <item.icon size={18} strokeWidth={1.7} />
                  <span>{item.name}</span>
                  {item.id === 'triage' && data.dashboard.pendingTriage > 0 && (
                    <span className="nav-count">{data.dashboard.pendingTriage}</span>
                  )}
                  {item.id === 'orders' && data.dashboard.unseenOrders.length > 0 && (
                    <span className="nav-dot" />
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <Sparkles size={18} />
            <strong>Mais leveza para sua rotina.</strong>
            <p>Seu negócio cresce no seu ritmo.</p>
          </div>
          {admin && (
            <button
              className={`nav-item ${page === 'settings' ? 'active' : ''}`}
              aria-label="Configurações"
              title="Configurações"
              onClick={() => navigate('settings')}
            >
              <Settings size={18} strokeWidth={1.7} />
              <span>Configurações</span>
            </button>
          )}
          <button
            className="nav-item"
            aria-label="Ajuda"
            title="Ajuda"
            onClick={() =>
              openDialog({
                title: 'Encontre seu ritmo com o Compasso',
                description: 'Um guia rápido para começar.',
                content: (
                  <div className="help-steps">
                    {(admin
                      ? [
                          [
                            '1',
                            'Prepare seu catálogo',
                            'Cadastre seus serviços, produtos, valores e duração.',
                          ],
                          [
                            '2',
                            'Convide seus clientes',
                            'Eles encontram seu estabelecimento pelo nome no cadastro.',
                          ],
                          [
                            '3',
                            'Acompanhe seu dia',
                            'Revise triagens, finalize atendimentos e registre os pagamentos.',
                          ],
                          [
                            '4',
                            'Cultive suas conexões',
                            'Leia avaliações, envie mensagens e acompanhe os retornos.',
                          ],
                        ]
                      : [
                          [
                            '1',
                            'Encontre seu cuidado',
                            'Conheça os produtos e serviços do catálogo.',
                          ],
                          [
                            '2',
                            'Escolha um horário',
                            'Agende ou adicione os itens à sacola para confirmar.',
                          ],
                          [
                            '3',
                            'Fique por perto',
                            'Consulte seus pedidos e notificações para acompanhar tudo.',
                          ],
                          [
                            '4',
                            'Conte sua experiência',
                            'Avalie o atendimento e programe um lembrete de retorno.',
                          ],
                        ]
                    ).map(([number, title, description]) => (
                      <div key={number}>
                        <span>{number}</span>
                        <div>
                          <strong>{title}</strong>
                          <p>{description}</p>
                        </div>
                      </div>
                    ))}
                    <p className="form-note">
                      Pagamentos online e WhatsApp Business ainda não estão habilitados.
                    </p>
                  </div>
                ),
              })
            }
          >
            <CircleHelp size={18} strokeWidth={1.7} />
            <span>Preciso de uma mão</span>
          </button>
          <div className="sidebar-profile">
            <Avatar name={data.user.name} />
            <div>
              <strong>{data.user.name}</strong>
              <small>{admin ? 'Administradora' : 'Cliente'}</small>
            </div>
            <button className="icon-button" aria-label="Sair da conta" onClick={logout}>
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
      <div className="workspace">
        {!admin && (
          <CustomerHeader
            name={data.user.name}
            page={page}
            cartCount={cart.length}
            unread={unread}
            navigate={navigate}
            openMenu={() => setMobile(true)}
            openNotifications={() => setNotifications(!notifications)}
          />
        )}
        <header className={`topbar ${admin ? '' : 'admin-topbar-hidden'}`}>
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Abrir menu"
              onClick={() => setMobile(true)}
            >
              <Menu size={21} />
            </button>
            <a
              className="admin-mobile-brand brand"
              href="/"
              onClick={(event) => {
                event.preventDefault();
                navigate('home');
              }}
            >
              <Brand />
            </a>
            <span>{admin ? 'Meu negócio' : 'Meu espaço'}</span>
            <ChevronRight size={13} />
            <strong>{currentLabel}</strong>
          </div>
          <div className="topbar-actions">
            <button className="topbar-search" aria-label="Pesquisar na plataforma" onClick={search}>
              <Search size={16} />
              <span>Encontre algo…</span>
              <kbd>⌘ K</kbd>
            </button>
            {!admin && (
              <button
                className="icon-button notification-button"
                aria-label={`Sacola com ${cart.length} itens`}
                onClick={() => navigate('cart')}
              >
                <ShoppingBag size={19} />
                {cart.length > 0 && <span className="icon-count">{cart.length}</span>}
              </button>
            )}
            <button
              className={`icon-button notification-button ${notifications ? 'selected' : ''}`}
              aria-label={`Notificações, ${unread} não lidas`}
              onClick={() => setNotifications(!notifications)}
            >
              <Bell size={20} strokeWidth={1.6} />
              {unread > 0 && <span className="notification-dot" />}
            </button>
            <span className="topbar-divider" />
            <button
              className="topbar-user"
              aria-label={`Conta de ${data.user.name}`}
              onClick={() => navigate(admin ? 'settings' : 'profile')}
            >
              <Avatar name={data.user.name} size="small" />
              <span>{data.user.name.split(' ')[0]}</span>
              <ChevronDown size={14} />
            </button>
          </div>
        </header>
        <nav className="pulse-section-nav" aria-label="Atalhos principais">
          {(admin
            ? adminNavigation[0].items.slice(0, 4)
            : customerNavigation[0].items.filter((item) =>
                ['home', 'discovery', 'appointments', 'profile'].includes(item.id),
              )
          ).map((item) => (
            <button
              key={item.id}
              aria-current={page === item.id ? 'page' : undefined}
              onClick={() => navigate(item.id)}
            >
              {item.name}
            </button>
          ))}
        </nav>
        {notifications && (
          <section className="notifications-popover">
            <div className="panel-heading">
              <h2>Suas notificações</h2>
              <button
                className="icon-button"
                aria-label="Fechar notificações"
                onClick={() => setNotifications(false)}
              >
                <X size={17} />
              </button>
            </div>
            {data.notifications.length ? (
              data.notifications.map((n) => (
                <button
                  className={`notification-item ${n.read ? '' : 'unread'}`}
                  key={n.id}
                  onClick={() =>
                    mutate(
                      `notifications/${n.id}`,
                      'PATCH',
                      {},
                      'Notificação marcada como lida.',
                    ).catch((e) => notify(e.message, true))
                  }
                >
                  <span>
                    <Bell size={17} />
                  </span>
                  <div>
                    <strong>{n.title}</strong>
                    <p>{n.message}</p>
                    <small>
                      {day(n.createdAt)} • {time(n.createdAt)}
                    </small>
                  </div>
                  {!n.read && <i />}
                </button>
              ))
            ) : (
              <p className="notifications-empty">Tudo em dia. Seus avisos aparecerão aqui.</p>
            )}
          </section>
        )}
        <main className="main-content" key={page}>
          {data.user.role === 'admin' && page !== 'settings' && <StoreTrialBanner revision={revision} manage={() => setPage('settings')} />}
          {fatal && (
            <div className="error-message" role="alert">
              {fatal}
            </div>
          )}
          {content}
        </main>
      </div>
      {dialog && <Dialog key={dialog.key} dialog={dialog} close={() => setDialog(undefined)} />}
      {toast && (
        <div
          className={`toast ${toast.error ? 'error' : ''}`}
          role={toast.error ? 'alert' : 'status'}
        >
          <span>{toast.error ? <X size={17} /> : <Check size={17} />}</span>
          {toast.message}
          <button aria-label="Fechar aviso" onClick={() => setToast(undefined)}>
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
function SearchDialog({ data, go }: { data: Bootstrap; go: (page: string) => void }) {
  const [query, setQuery] = useState('');
  const needle = query.toLocaleLowerCase();
  return (
    <div className="search-dialog">
      <label className="search-field">
        <Search size={18} />
        <input
          autoFocus
          placeholder="O que você está procurando?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <h3>Serviços e produtos</h3>
      {data.catalog
        .filter((i) => i.name.toLowerCase().includes(needle))
        .slice(0, 5)
        .map((item) => (
          <button key={item.id} onClick={() => go('catalog')}>
            <Package size={18} />
            <div>
              <strong>{item.name}</strong>
              <small>{item.category}</small>
            </div>
            <ChevronRight size={16} />
          </button>
        ))}
      <h3>Agendamentos</h3>
      {data.appointments
        .filter((a) => `${a.customerName} ${a.itemName}`.toLowerCase().includes(needle))
        .slice(0, 5)
        .map((a) => (
          <button key={a.id} onClick={() => go('appointments')}>
            <CalendarDays size={18} />
            <div>
              <strong>
                {a.customerName} • {a.itemName}
              </strong>
              <small>
                {day(a.startsAt)} às {time(a.startsAt)}
              </small>
            </div>
            <ChevronRight size={16} />
          </button>
        ))}
    </div>
  );
}
