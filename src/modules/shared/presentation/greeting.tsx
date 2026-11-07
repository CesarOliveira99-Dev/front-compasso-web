'use client';
import { useEffect, useState } from 'react';
import { greetingForHour } from '../domain/greeting';
export function Greeting({ name }: { name: string }) {
  const [greeting, setGreeting] = useState('Olá');
  useEffect(() => {
    const refresh = () => setGreeting(greetingForHour(new Date().getHours()));
    refresh();
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    const timer = setInterval(refresh, 60000);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);
  return (
    <p className="customer-greeting">
      {greeting}, {name.trim().split(/\s+/)[0]}!
    </p>
  );
}
