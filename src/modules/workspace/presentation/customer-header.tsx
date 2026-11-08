import { Bell, CalendarDays, Compass, Menu, ShoppingBag } from 'lucide-react';
import { Brand } from '@/modules/shared/presentation/brand';
import { Avatar } from '@/modules/shared/presentation/ui';
interface Props {
  name: string;
  page: string;
  cartCount: number;
  unread: number;
  navigate: (page: string) => void;
  openMenu: () => void;
  openNotifications: () => void;
}
export function CustomerHeader({
  name,
  page,
  cartCount,
  unread,
  navigate,
  openMenu,
  openNotifications,
}: Props) {
  return (
    <header className="customer-header authenticated">
      <button className="customer-more icon-button" aria-label="Mais opções do menu" onClick={openMenu}>
        <Menu size={20} />
      </button>
      <a
        className="brand"
        href="/"
        onClick={(event) => {
          event.preventDefault();
          navigate('home');
        }}
      >
        <Brand />
      </a>
      <div className="customer-header-tools">
        <button
          className="icon-button"
          aria-label={`Sacola com ${cartCount} itens`}
          onClick={() => navigate('cart')}
        >
          <ShoppingBag size={18} />
        </button>
        <button
          className="icon-button"
          aria-label={`Notificações, ${unread} não lidas`}
          onClick={openNotifications}
        >
          <Bell size={18} />
          {unread > 0 && <span className="notification-dot" />}
        </button>
        <button
          className="customer-profile"
          aria-label={`Minha conta, ${name}`}
          aria-current={page === 'profile' ? 'page' : undefined}
          onClick={() => navigate('profile')}
        >
          <Avatar name={name} />
        </button>
      </div>
      <nav className="customer-navigation" aria-label="Menu principal">
        <button
          aria-current={['home', 'discovery'].includes(page) ? 'page' : undefined}
          onClick={() => navigate('home')}
        >
          <Compass size={17} />
          <span>Descobrir espaços</span>
        </button>
        <button
          aria-current={page === 'appointments' ? 'page' : undefined}
          onClick={() => navigate('appointments')}
        >
          <CalendarDays size={17} />
          <span>Meus agendamentos</span>
        </button>
      </nav>
    </header>
  );
}
