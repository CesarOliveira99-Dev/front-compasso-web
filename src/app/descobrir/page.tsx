import { Discovery } from '@/modules/stores/presentation/discovery';
import { Brand } from '@/modules/shared/presentation/brand';
export default function Page() {
  return (
    <div className="public-discovery">
      <header className="customer-header">
        <a className="brand" href="/">
          <Brand />
        </a>
        <a className="button primary" href="/">
          Entrar
        </a>
      </header>
      <main className="public-discovery-main">
        <Discovery />
      </main>
    </div>
  );
}
