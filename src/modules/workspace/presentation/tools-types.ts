export interface AgendaPreferences {
  revision: number;
  theme: "light" | "dark" | "paper";
  accent: string;
  storeDefault: boolean;
  categories: { id: string; name: string; color: string }[];
}
export interface AgendaContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  internal: boolean;
  visits: number;
}
export interface CustomerDossier {
  customer: AgendaContact;
  dossier: {
    revision: number;
    notes: string;
    preferences: string;
    tags: string[];
    fields: { label: string; value: string }[];
    updatedAt?: string;
    updatedBy?: string;
  };
  appointments: import("@/modules/shared/domain/models").Appointment[];
  loyalty: {
    goal: number;
    reward: string;
    redemptions: number;
    visits: number;
    available: number;
  } | null;
}
export interface AgendaAnalysis {
  clientMix: AgendaChartSlice[];
  firstTimeClients: number;
  recurringClients: number;
  attendanceCategories: AgendaChartSlice[];
  services: AgendaChartSlice[];
  trendGrouping: "day" | "week" | "month";
  trend: {
    key: string;
    start: string;
    end: string;
    clients: number;
    completed: number;
  }[];
  firstDate: string;
  today: string;
  days: number;
  total: number;
  completed: number;
  cancelled: number;
  productionCents: number;
  clients: number;
  returningClients: number;
  scope: "workspace" | "professional";
  categories: {
    name: string;
    color: string;
    count: number;
    amountCents: number;
  }[];
  daily: { date: string; count: number; completed: number }[];
}

export interface AgendaChartSlice {
  id: string;
  name: string;
  color: string;
  count: number;
}
