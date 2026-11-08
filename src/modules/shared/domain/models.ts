export interface BusinessAddress {
  postalCode: string;
  street: string;
  number: string;
  district: string;
  city: string;
  state: string;
  complement: string;
}
export interface MediaAsset {
  category?: 'workspace' | 'portfolio';
  url: string;
  type: 'image' | 'video';
  alt: string;
}
export interface StoreSummary {
  slug: string;
  businessName: string;
  city?: string;
  state?: string;
}
export type Role = 'admin' | 'customer' | 'employee';
export interface User {
  storeSelected?: boolean;
  identityId?: string;
  professionalId?: string;
  emailVerified?: boolean;
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
}
export interface Address {
  id: string;
  label: string;
  street: string;
  number: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
}
export interface Customer extends User {
  addresses: Address[];
  visits: number;
  totalCents: number;
}
export interface CatalogItem {
  popularityCount?: number;
  media?: MediaAsset[];
  id: string;
  name: string;
  description: string;
  kind: 'service' | 'product';
  category: string;
  priceCents: number;
  currentPriceCents: number;
  percentOff: number;
  durationMinutes: number;
  requiresTriage: boolean;
  active: boolean;
}
export interface Appointment {
  professionalId?: string;
  professionalName?: string;
  id: string;
  customerId: string;
  customerName: string;
  itemId: string;
  itemName: string;
  startsAt: string;
  endsAt: string;
  priceCents: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid';
  notes: string;
  orderId?: string;
}
export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: {
    itemId: string;
    name: string;
    quantity: number;
    kind: string;
    unitPriceCents: number;
    startsAt?: string;
  }[];
  totalCents: number;
  discountCents: number;
  status: string;
  paymentStatus: string;
  paymentMethod: 'on_day' | 'online' | 'pix_manual';
  pixKey?: string;
  seen: boolean;
  createdAt: string;
  address?: Address;
}
export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
export interface Settings {
  ratingCount?: number;
  averageRating?: number;
  address?: BusinessAddress;
  phone?: string;
  description?: string;
  media?: MediaAsset[];
  setupComplete?: boolean;
  name: string;
  businessName: string;
  slug: string;
  timezone: string;
  completionMode: 'manual' | 'automatic';
  payOnAppointment: boolean;
  payOnDelivery: boolean;
  bankAccount: string;
  pixKey: string;
  weeklyHours?: { day: number; openingHour: number; closingHour: number }[];
  openingHour: number;
  closingHour: number;
  workDays: number[];
  onlinePaymentsEnabled: boolean;
  manualPixEnabled: boolean;
  whatsappEnabled: boolean;
}
export interface Dashboard {
  greeting: string;
  date: string;
  week: { start: string; end: string };
  today: {
    completed: Appointment[];
    completedOrders: Order[];
    remaining: Appointment[];
    showCompleted: boolean;
  };
  upcoming: Appointment[];
  weekMinutes: number;
  weekRevenueCents: number;
  weekAppointments: number;
  completedCount: number;
  unseenOrders: Order[];
  pendingTriage: number;
  averageRating: number;
  weekDays: { date: string; minutes: number; appointments: number }[];
}
export interface Discount {
  id: string;
  name: string;
  code?: string;
  percent: number;
  itemIds: string[];
  kinds: string[];
  weekdays: number[];
  startsAt: string;
  expiresAt: string;
  maxUses: number;
  uses: number;
  active: boolean;
}
export interface Feedback {
  published?: boolean;
  id: string;
  customerId: string;
  customerName: string;
  appointmentId: string;
  rating: number;
  comment: string;
  reply: string;
  createdAt: string;
}
export interface Triage {
  id: string;
  customerId: string;
  customerName: string;
  appointmentId?: string;
  orderId?: string;
  answers: string;
  status: string;
  decision: string;
  createdAt: string;
}
export interface Loyalty {
  id: string;
  itemId: string;
  itemName: string;
  nextDate: string;
  note: string;
  status: string;
}
export interface WalletEntry {
  id: string;
  name: string;
  customerName: string;
  amountCents: number;
  date: string;
  paymentStatus: string;
  kind?: string;
}
export interface Wallet {
  days: number;
  cashReceivedCents: number;
  expenseCents: number;
  balanceCents: number;
  undatedReceivedCents: number;
  periodStart: string;
  periodEnd: string;
  cashEntries: WalletEntry[];
  expenses: Expense[];
  earnedCents: number;
  receivedCents: number;
  unpaidCents: number;
  projectedCents: number;
  entries: WalletEntry[];
  projection: WalletEntry[];
}
export interface Expense {
  id: string;
  description: string;
  category: 'supplies' | 'rent' | 'utilities' | 'other';
  amountCents: number;
  paidOn: string;
  createdAt: string;
}
export interface Report {
  month: string;
  total: number;
  completed: number;
  cancelled: number;
  totalCents: number;
  appointments: Appointment[];
}
export interface Bootstrap {
  user: User;
  settings: Settings;
  dashboard: Dashboard;
  catalog: CatalogItem[];
  appointments: Appointment[];
  notifications: Notification[];
}
export interface CartLine {
  professionalId?: string;
  itemId: string;
  quantity: number;
  startsAt: string;
  notes: string;
}
export interface Professional {
  breaks?: { start: string; end: string; date?: string }[];
  daysOff?: string[];
  id: string;
  name: string;
  active: boolean;
  serviceIds: string[];
  weeklyHours?: { day: number; openingHour: number; closingHour: number }[];
  openingHour: number;
  closingHour: number;
  workDays: number[];
}
