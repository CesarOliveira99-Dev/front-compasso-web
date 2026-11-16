'use client';
import { Discovery } from '@/modules/stores/presentation/discovery';
import { DiscoveryHeader } from '@/modules/stores/presentation/discovery-header';
import type { User } from '@/modules/shared/domain/models';
import { LastVisitPanel } from '@/modules/dashboard/presentation/last-visit';

export function CustomerLobby({ user }: { user: User }) {
  return (
    <div className="public-discovery">
      <DiscoveryHeader user={user} />
      <main className="public-discovery-main">
        <p className="form-note">
          Sua conta está pronta. Explore os estabelecimentos e escolha seu próximo cuidado.
        </p>
        <LastVisitPanel user={user} />
        <Discovery />
      </main>
    </div>
  );
}
