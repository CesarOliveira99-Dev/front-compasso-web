'use client';

interface MonthPickerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  min?: string;
  max?: string;
}

export function MonthPicker({ value, onChange, label, min, max }: MonthPickerProps) {
  const formatted = new Intl.DateTimeFormat('pt-BR', {
    month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(`${value}-01T12:00:00Z`));
  const display = formatted.charAt(0).toLocaleUpperCase('pt-BR') + formatted.slice(1);
  return <span className="month-picker">
    <span aria-hidden="true">{display}</span>
    <input type="month" aria-label={label} value={value} min={min} max={max}
      onChange={event => { if (event.target.value) onChange(event.target.value); }} />
  </span>;
}

