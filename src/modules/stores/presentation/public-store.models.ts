import type { CatalogItem, Settings } from '@/modules/shared/domain/models';
import type { StoreReviewData } from '@/modules/feedback/presentation/reputation';
export interface PublicStoreData {
  store: Pick<
    Settings,
    | 'slug'
    | 'businessName'
    | 'description'
    | 'address'
    | 'phone'
    | 'media'
    | 'weeklyHours'
    | 'openingHour'
    | 'closingHour'
    | 'workDays'
  >;
  catalog: Pick<
    CatalogItem,
    | 'id'
    | 'name'
    | 'description'
    | 'kind'
    | 'category'
    | 'media'
    | 'durationMinutes'
    | 'priceCents'
    | 'currentPriceCents'
    | 'percentOff'
    | 'popularityCount'
  >[];
  professionals: { id: string; name: string; serviceIds: string[] }[];
  reputation: StoreReviewData;
}
export const weekDays = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];
export const hourLabel = (hour: number) => `${String(hour).padStart(2, '0')}:00`;
