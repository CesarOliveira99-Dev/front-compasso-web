export function greetingForHour(hour: number): string {
  return hour >= 5 && hour < 12
    ? "Bom dia"
    : hour >= 12 && hour < 18
      ? "Boa tarde"
      : "Boa noite";
}
export function greetingForDate(date: Date, timeZone?: string): string {
  const hour = timeZone
    ? Number(
        new Intl.DateTimeFormat("en-GB", {
          timeZone,
          hour: "2-digit",
          hourCycle: "h23",
        }).format(date),
      )
    : date.getHours();
  return greetingForHour(hour);
}
