"use client";
import { useEffect, useState } from "react";
import { greetingForDate } from "../domain/greeting";
export function Greeting({
  name,
  timeZone,
}: {
  name: string;
  timeZone?: string;
}) {
  const [greeting, setGreeting] = useState("Olá");
  useEffect(() => {
    const refresh = () => setGreeting(greetingForDate(new Date(), timeZone));
    refresh();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    const timer = setInterval(refresh, 60000);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [timeZone]);
  return (
    <p className="customer-greeting">
      {greeting}, {name.trim().split(/\s+/)[0]}!
    </p>
  );
}
