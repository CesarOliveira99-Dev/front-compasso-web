"use client";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Columns3,
  MoveHorizontal,
  Plus,
} from "lucide-react";
import type { Appointment, Bootstrap } from "@/modules/shared/domain/models";
import { Badge, Empty, PageHeading } from "@/modules/shared/presentation/ui";
import {
  addDays,
  appointmentDates,
  appointmentDaySegment,
  appointmentLanes,
  calendarLabel,
  clockLabel,
  clockMinutes,
  dateFromKey,
  dateInZone,
  monthDays,
  monthWeeks,
  shiftMonth,
  validDateKey,
  weekDays,
  weekLabel,
  weekStart,
  type CalendarView,
} from "../domain/calendar";

interface Props {
  data: Bootstrap;
  onOpen: (appointment: Appointment) => void;
  onNew?: () => void;
}
export function StaffCalendar({ data, onOpen, onNew }: Props) {
  const timezone = data.settings.timezone || "America/Sao_Paulo";
  const [today, setToday] = useState(() => dateInZone(new Date(), timezone));
  const [selectedDate, setSelectedDate] = useState(today);
  const [month, setMonth] = useState(today.slice(0, 7));
  const [view, setView] = useState<CalendarView>("Semana");
  const [professional, setProfessional] = useState("");
  const employee = data.user.role === "employee";
  useEffect(() => {
    const update = () => setToday(dateInZone(new Date(), timezone));
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, [timezone]);
  const accessible = data.appointments.filter(
    (a) =>
      a.status !== "cancelled" &&
      (!employee ||
        (Boolean(data.user.professionalId) &&
          a.professionalId === data.user.professionalId)),
  );
  const professionals = Array.from(
    new Map(
      accessible.map((a) => [
        a.professionalId || "principal",
        a.professionalName || data.settings.name,
      ]),
    ).entries(),
  ).sort((a, b) => a[0].localeCompare(b[0]));
  const appointments = accessible.filter(
    (a) => !professional || (a.professionalId || "principal") === professional,
  );
  const byDate = useMemo(() => {
    const grouped = new Map<string, Appointment[]>();
    for (const appointment of appointments) {
      for (const key of appointmentDates(appointment, timezone)) {
        const list = grouped.get(key) || [];
        list.push(appointment);
        grouped.set(key, list);
      }
    }
    for (const list of grouped.values())
      list.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    return grouped;
  }, [
    data.appointments,
    professional,
    employee,
    data.user.professionalId,
    timezone,
  ]);
  const days = weekDays(selectedDate);
  const range =
    view === "Mês"
      ? monthDays(month).filter((key) => key.startsWith(month))
      : view === "Semana"
        ? days
        : [selectedDate];
  const periodAppointments = [
    ...new Map(
      range.flatMap((key) => byDate.get(key) || []).map((a) => [a.id, a]),
    ).values(),
  ];
  const weekAppointments = [
    ...new Map(
      days.flatMap((key) => byDate.get(key) || []).map((a) => [a.id, a]),
    ).values(),
  ];
  const opening =
    data.settings.workspaceMode === "solo"
      ? 0
      : Math.max(
          0,
          Math.min(
            data.settings.openingHour,
            ...weekAppointments.map((a) =>
              Math.floor(clockMinutes(a.startsAt, timezone) / 60),
            ),
          ),
        );
  const closing =
    data.settings.workspaceMode === "solo"
      ? 24
      : Math.min(
          24,
          Math.max(
            opening + 1,
            data.settings.closingHour,
            ...weekAppointments.map((a) =>
              Math.ceil(
                (clockMinutes(a.startsAt, timezone) +
                  (Date.parse(a.endsAt) - Date.parse(a.startsAt)) / 60000) /
                  60,
              ),
            ),
          ),
        );
  const rowHeight = weekAppointments.some(
    (a) => Date.parse(a.endsAt) - Date.parse(a.startsAt) < 1800000,
  )
    ? 96
    : 64;
  const label =
    view === "Mês"
      ? calendarLabel(month + "-01", { month: "long", year: "numeric" })
      : view === "Semana"
        ? weekLabel(selectedDate)
        : calendarLabel(selectedDate);
  const periodKey =
    view + "-" + (view === "Mês" ? month : weekStart(selectedDate));
  function color(appointment: Appointment) {
    if (appointment.status === "pending") return "pastel-pink";
    if (appointment.status === "completed") return "pastel-neutral";
    const index = professionals.findIndex(
      ([id]) => id === (appointment.professionalId || "principal"),
    );
    return ["pastel-mint", "pastel-blue", "pastel-lavender", "pastel-cream"][
      Math.max(0, index) % 4
    ];
  }
  function selectDate(key: string, nextView: CalendarView = view) {
    setSelectedDate(key);
    setMonth(key.slice(0, 7));
    setView(nextView);
  }
  function shift(direction: number) {
    if (view === "Mês") {
      const next = shiftMonth(month, direction);
      if (validDateKey(next + "-01")) {
        setMonth(next);
        setSelectedDate(next + "-01");
      }
    } else {
      const next = addDays(
        selectedDate,
        direction * (view === "Semana" ? 7 : 1),
      );
      if (validDateKey(next)) selectDate(next);
    }
  }
  function changeView(next: CalendarView) {
    setView(next);
  }
  function openMonth(value: string) {
    if (validDateKey(value + "-01")) {
      setMonth(value);
      setSelectedDate(value + "-01");
      setView("Mês");
    }
  }
  const daily = byDate.get(selectedDate) || [];
  return (
    <section className="staff-calendar">
      <section
        className="staff-quick-calendar"
        aria-label="Escolher dia da agenda"
      >
        <div className="staff-quick-calendar-heading">
          <button
            aria-label="Mês anterior no seletor"
            onClick={() => {
              const next = shiftMonth(month, -1);
              if (validDateKey(next + "-01")) selectDate(next + "-01");
            }}
          >
            <ChevronLeft size={17} />
          </button>
          <strong aria-live="polite">
            {calendarLabel(month + "-01", { month: "long", year: "numeric" })}
          </strong>
          <button
            aria-label="Próximo mês no seletor"
            onClick={() => {
              const next = shiftMonth(month, 1);
              if (validDateKey(next + "-01")) selectDate(next + "-01");
            }}
          >
            <ChevronRight size={17} />
          </button>
        </div>
        <div className="staff-quick-calendar-grid">
          {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day) => (
            <span key={day} aria-hidden="true">
              {day}
            </span>
          ))}
          {monthDays(month).map((key) => {
            const count = byDate.get(key)?.length || 0;
            return (
              <button
                key={key}
                className={`${key.startsWith(month) ? "" : "outside"} ${count ? "has-appointments" : ""}`}
                aria-pressed={key === selectedDate}
                aria-current={key === today ? "date" : undefined}
                aria-label={`${calendarLabel(key)}; ${count} ${count === 1 ? "atendimento" : "atendimentos"}. Abrir dia`}
                onClick={() => selectDate(key, "Dia")}
              >
                {dateFromKey(key).getUTCDate()}
              </button>
            );
          })}
        </div>
        <p>
          Os dias destacados têm atendimentos. Selecione uma data para ver os
          horários.
        </p>
      </section>
      <div className="staff-calendar-main">
        <PageHeading
          title={employee ? "Sua agenda" : "Calendário"}
          description={`${data.settings.businessName} · ${data.settings.workspaceMode === "solo" ? "Sua agenda privada" : employee ? "Seus atendimentos" : "Agenda da equipe"}`}
          action={
            onNew && (
              <button className="button primary" onClick={onNew}>
                <Plus size={17} /> Agendamento
              </button>
            )
          }
        />
        <div className="staff-calendar-toolbar">
          <div className="staff-calendar-period">
            <button
              className="button secondary calendar-arrow"
              aria-label="Período anterior"
              onClick={() => shift(-1)}
            >
              <ChevronLeft size={16} />
            </button>
            <strong aria-live="polite">{label}</strong>
            <button
              className="button secondary calendar-arrow"
              aria-label="Próximo período"
              onClick={() => shift(1)}
            >
              <ChevronRight size={16} />
            </button>
            <button
              className="button secondary"
              onClick={() => selectDate(today, "Semana")}
            >
              Hoje
            </button>
          </div>
          <div
            className="calendar-view-switch"
            aria-label="Visualização do calendário"
          >
            {(
              [
                { label: "Dia", icon: CalendarClock },
                { label: "Semana", icon: Columns3 },
                { label: "Mês", icon: CalendarDays },
              ] as const
            ).map(({ label: option, icon: Icon }) => (
              <button
                key={option}
                aria-pressed={view === option}
                onClick={() => changeView(option)}
              >
                <Icon size={16} />
                {option}
              </button>
            ))}
          </div>
        </div>
        <div className="staff-calendar-pickers">
          <label>
            Mês e ano
            <input
              type="month"
              aria-label="Escolher mês e ano"
              value={month}
              min="1900-01"
              max="2099-12"
              onChange={(e) => openMonth(e.target.value)}
            />
          </label>
          <label>
            Ir para a semana
            <select
              aria-label="Escolher semana do mês"
              value={weekStart(selectedDate)}
              onChange={(e) => {
                if (validDateKey(e.target.value)) {
                  setSelectedDate(e.target.value);
                  setView("Semana");
                }
              }}
            >
              {monthWeeks(month).map((key) => (
                <option key={key} value={key}>
                  {weekLabel(key)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="staff-calendar-meta">
          <div className="calendar-legend">
            {professionals.map(([id, name], i) => (
              <span key={id}>
                <b
                  className={
                    [
                      "pastel-mint",
                      "pastel-blue",
                      "pastel-lavender",
                      "pastel-cream",
                    ][i % 4]
                  }
                />
                {name}
              </span>
            ))}
            {data.settings.workspaceMode !== "solo" && (
              <span>
                <b className="pastel-pink" />
                Em triagem
              </span>
            )}
            <span>
              <b className="pastel-neutral" />
              Concluído
            </span>
          </div>
          {!employee && data.settings.workspaceMode !== "solo" && (
            <select
              aria-label="Filtrar agenda por profissional"
              value={professional}
              onChange={(e) => setProfessional(e.target.value)}
            >
              <option value="">Todos os profissionais</option>
              {professionals.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          )}
        </div>
        {view !== "Dia" && (
          <div className="calendar-pan-hint">
            <span>
              <MoveHorizontal size={16} /> Deslize para ver todos os dias
            </span>
            <small>Rolagem lateral</small>
          </div>
        )}
        {view === "Mês" ? (
          <>
            <div
              className="staff-calendar-pan"
              key={periodKey}
              role="region"
              aria-label="Calendário mensal com rolagem horizontal"
              tabIndex={0}
            >
              <div className="staff-month">
                <div className="staff-month-head">
                  {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map(
                    (day) => (
                      <span key={day}>{day}</span>
                    ),
                  )}
                </div>
                <div className="staff-month-grid">
                  {monthDays(month).map((key) => {
                    const list = byDate.get(key) || [];
                    return (
                      <button
                        className={`staff-month-day ${key.startsWith(month) ? "" : "outside"} ${key === selectedDate ? "selected" : ""}`}
                        key={key}
                        aria-current={key === today ? "date" : undefined}
                        aria-label={`Abrir semana de ${calendarLabel(key)}; ${list.length} atendimentos`}
                        onClick={() => selectDate(key, "Semana")}
                      >
                        <span className="month-day-number">
                          {dateFromKey(key).getUTCDate()}
                        </span>
                        <span className="staff-month-events">
                          {list.slice(0, 2).map((a) => (
                            <span
                              style={
                                a.categoryColor
                                  ? {
                                      borderLeft: `4px solid ${a.categoryColor}`,
                                    }
                                  : undefined
                              }
                              className={`staff-month-event ${color(a)}`}
                              key={a.id}
                            >
                              {clockLabel(a.startsAt, timezone)}{" "}
                              <strong>{a.customerName.split(" ")[0]}</strong>
                            </span>
                          ))}
                          {list.length > 2 && (
                            <small>+{list.length - 2} atendimentos</small>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <p className="calendar-instruction">
              Selecione uma data para abrir a semana correspondente.
            </p>
          </>
        ) : view === "Semana" ? (
          <div
            className="staff-calendar-pan"
            key={periodKey}
            role="region"
            aria-label="Calendário semanal com rolagem horizontal"
            tabIndex={0}
          >
            <div className="staff-week">
              <div className="staff-week-corner" />
              {days.map((key) => (
                <button
                  className={`staff-week-day ${selectedDate === key ? "selected" : ""}`}
                  key={key}
                  aria-current={key === today ? "date" : undefined}
                  aria-label={`Selecionar ${calendarLabel(key)}`}
                  onClick={() => setSelectedDate(key)}
                >
                  <strong>
                    {String(dateFromKey(key).getUTCDate()).padStart(2, "0")}
                  </strong>
                  <span>{calendarLabel(key, { weekday: "short" })}</span>
                </button>
              ))}
              <div
                className="staff-time-axis"
                style={{ height: (closing - opening) * rowHeight }}
              >
                {Array.from({ length: closing - opening }, (_, i) => (
                  <span key={i} style={{ height: rowHeight }}>
                    {String(opening + i).padStart(2, "0")}:00
                  </span>
                ))}
              </div>
              {days.map((key) => (
                <div
                  className="staff-week-column"
                  key={key}
                  style={{
                    height: (closing - opening) * rowHeight,
                    backgroundSize: `100% ${rowHeight}px`,
                  }}
                >
                  {appointmentLanes(byDate.get(key) || []).map(
                    ({ appointment: a, lane, lanes }) => {
                      const segment = appointmentDaySegment(a, key, timezone);
                      const duration = segment.end - segment.start,
                        height = (duration * rowHeight) / 60 - 6;
                      return (
                        <button
                          className={`staff-calendar-event ${color(a)} ${height < 70 ? "compact" : ""}`}
                          key={a.id}
                          style={{
                            borderLeft: a.categoryColor
                              ? `5px solid ${a.categoryColor}`
                              : undefined,
                            top:
                              ((segment.start - opening * 60) * rowHeight) /
                                60 +
                              3,
                            height: Math.max(16, height),
                            left: `calc(${(lane * 100) / lanes}% + 3px)`,
                            width: `calc(${100 / lanes}% - 6px)`,
                          }}
                          aria-label={`${a.customerName}, ${a.itemName}, ${clockLabel(a.startsAt, timezone)}–${clockLabel(a.endsAt, timezone)}, ${a.professionalName || data.settings.name}, ${a.status === "pending" ? "Em triagem" : a.status === "completed" ? "Concluído" : "Confirmado"}`}
                          title={`${a.customerName} · ${a.itemName} · ${clockLabel(a.startsAt, timezone)}`}
                          onClick={() => onOpen(a)}
                        >
                          <span>
                            {dateInZone(new Date(a.startsAt), timezone) === key
                              ? clockLabel(a.startsAt, timezone)
                              : "Continuação"}
                          </span>
                          <strong>{a.customerName}</strong>
                          <span className="event-service">
                            {a.itemName}
                            {a.categoryName ? ` · ${a.categoryName}` : ""}
                          </span>
                        </button>
                      );
                    },
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <section className="staff-day-view">
            <div className="staff-day-strip" aria-label="Dias da semana">
              {days.map((key) => (
                <button
                  key={key}
                  aria-pressed={key === selectedDate}
                  onClick={() => selectDate(key, "Dia")}
                >
                  <span>{calendarLabel(key, { weekday: "short" })}</span>
                  <strong>{dateFromKey(key).getUTCDate()}</strong>
                </button>
              ))}
            </div>
            <h2>{calendarLabel(selectedDate)}</h2>
            {daily.length ? (
              daily.map((a) => (
                <button
                  className={`staff-day-card ${color(a)}`}
                  style={
                    a.categoryColor
                      ? { borderLeft: `5px solid ${a.categoryColor}` }
                      : undefined
                  }
                  key={a.id}
                  onClick={() => onOpen(a)}
                >
                  <time>{clockLabel(a.startsAt, timezone)}</time>
                  <div>
                    <h3>{a.customerName}</h3>
                    <p>
                      {a.itemName} · {a.professionalName || data.settings.name}
                    </p>
                    <Badge status={a.status} />
                  </div>
                </button>
              ))
            ) : (
              <Empty
                title="Agenda livre"
                description="Nenhum atendimento nesta data."
              />
            )}
          </section>
        )}
        <div className="staff-calendar-summary" aria-live="polite">
          <span>
            <strong>{periodAppointments.length}</strong>{" "}
            {periodAppointments.length === 1 ? "atendimento" : "atendimentos"}{" "}
            {view === "Mês"
              ? "no mês"
              : view === "Semana"
                ? "na semana"
                : "no dia"}
          </span>
          <span>
            <strong>
              {periodAppointments.filter((a) => a.status === "pending").length}
            </strong>{" "}
            em triagem
          </span>
          <span>Fuso: {timezone}</span>
        </div>
      </div>
    </section>
  );
}
