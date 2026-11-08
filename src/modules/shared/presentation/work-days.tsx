const days = [
  { value: 1, label: 'Seg', name: 'Segunda-feira' },
  { value: 2, label: 'Ter', name: 'Terça-feira' },
  { value: 3, label: 'Qua', name: 'Quarta-feira' },
  { value: 4, label: 'Qui', name: 'Quinta-feira' },
  { value: 5, label: 'Sex', name: 'Sexta-feira' },
  { value: 6, label: 'Sáb', name: 'Sábado' },
  { value: 0, label: 'Dom', name: 'Domingo' },
];
export function WorkDays({ selected }: { selected: number[] }) {
  return (
    <fieldset className="work-days">
      <legend>Dias de atendimento</legend>
      <div className="work-days-scroll">
        {days.map((day) => (
          <label key={day.value} className="work-day">
            <input
              type="checkbox"
              name="workDays"
              value={day.value}
              aria-label={day.name}
              defaultChecked={selected.includes(day.value)}
            />
            <span>{day.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
