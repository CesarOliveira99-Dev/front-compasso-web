export interface CareSummary {
  completed: number;
  cancelled: number;
  missed: number;
  productionCents: number;
  lastVisit: string | null;
  lastService: string | null;
  daysSinceLast: number | null;
  averageMinutes: number;
  monthly: { month: string; count: number; productionCents: number }[];
}
export interface ReturnEntry {
  enabled?: boolean;
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  itemId: string;
  itemName: string;
  professionalId: string;
  intervalDays: number;
  revision: number;
  due: string | null;
  nextAppointment: string | null;
  state: "scheduled" | "no_history" | "overdue" | "due" | "later" | "paused";
}
export interface AgendaBlock {
  id: string;
  professionalId: string;
  title: string;
  startsAt: string;
  endsAt: string;
  revision: number;
  active: boolean;
}
export interface WaitEntry {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  itemId: string;
  itemName: string;
  professionalId: string;
  from: string;
  to: string;
  after: string;
  before: string;
  status: "waiting" | "contacted" | "booked" | "cancelled";
  revision: number;
}
export const reminderFields = [
  "nome",
  "servico",
  "data",
  "horario",
  "profissional",
  "estabelecimento",
];
export function reminderError(template: string) {
  if (!template.trim()) return "Escreva a mensagem.";
  if (template.length > 1500) return "Use até 1.500 caracteres.";
  const tokens = [...template.matchAll(/\{([^{}]*)\}/g)].map((m) => m[1]);
  if (
    tokens.some((key) => !reminderFields.includes(key)) ||
    /[{}]/.test(template.replace(/\{[^{}]*\}/g, ""))
  )
    return "Há uma variável inválida. Use os campos indicados abaixo.";
  return "";
}
export interface ReminderModel {
  id: string;
  title: string;
  message: string;
}
export interface ReminderModels {
  revision: number;
  template: string;
  templates: ReminderModel[];
}
