'use client';
import { Greeting } from '@/modules/shared/presentation/greeting';
import { Discovery } from '@/modules/stores/presentation/discovery';
import { type SectionProps } from '@/modules/shared/presentation/ui';
import { LastVisitPanel } from './last-visit';
export function CustomerHome(props: SectionProps) {
  return <div className="pulse-customer-home">
    <header className="pulse-customer-heading">
      <Greeting name={props.data.user.name} />
      <h1>Um bom cuidado<br />começa por aqui.</h1>
      <p>Encontre estabelecimentos, conheça a equipe e escolha seu horário.</p>
    </header>
    <LastVisitPanel user={props.data.user} revision={props.revision} />
    <Discovery embedded />
  </div>;
}
