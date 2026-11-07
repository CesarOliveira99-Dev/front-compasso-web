import { Discovery } from '@/modules/stores/presentation/discovery';
import { DiscoveryHeader } from '@/modules/stores/presentation/discovery-header';
export default function Page() {
  return (
    <div className="public-discovery">
      <DiscoveryHeader />
      <main className="public-discovery-main">
        <Discovery />
      </main>
    </div>
  );
}
