'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_TIMEZONE, TIMEZONES } from '../domain/timezone';
import { formatsForZone } from '../domain/format';
const TimezoneContext = createContext(DEFAULT_TIMEZONE);
export function TimezoneProvider({ timezone, children }: { timezone: string; children: React.ReactNode }) {
  return <TimezoneContext.Provider value={timezone}>{children}</TimezoneContext.Provider>;
}
export function useTimezone() { return useContext(TimezoneContext); }
export function useTimeFormats() { return formatsForZone(useTimezone()); }
export function TimezoneField({ value }: { value: string }) {
  const [otherZones, setOtherZones] = useState<string[]>([]);
  useEffect(() => {
    setOtherZones(Intl.supportedValuesOf('timeZone').filter(zone => !TIMEZONES.some(([known]) => known === zone) && zone !== value));
  }, [value]);
  return <label className="field"><span>Fuso horário do espaço</span><select name="timezone" defaultValue={value}>
    {!TIMEZONES.some(([zone]) => zone === value) && <option value={value}>{value}</option>}
    <optgroup label="Brasil">{TIMEZONES.map(([zone, label]) => <option key={zone} value={zone}>{label} — {zone}</option>)}</optgroup>
    <optgroup label="Outras regiões">{otherZones.map(zone => <option key={zone} value={zone}>{zone}</option>)}</optgroup>
  </select><small>Agenda e lembretes seguem este fuso. Alterar o fuso preserva o instante dos atendimentos existentes; os horários exibidos mudam.</small></label>;
}

