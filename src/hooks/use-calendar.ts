"use client";

import { useState, useCallback, useMemo } from "react";
import { addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from "date-fns";
import type { CalendarView } from "@/lib/calendar-utils";

export function useCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("month");

  const goNext = useCallback(() => {
    setCurrentDate((d) => {
      switch (view) {
        case "month": return addMonths(d, 1);
        case "week": return addWeeks(d, 1);
        case "day": return addDays(d, 1);
        default: return addMonths(d, 1);
      }
    });
  }, [view]);

  const goPrev = useCallback(() => {
    setCurrentDate((d) => {
      switch (view) {
        case "month": return subMonths(d, 1);
        case "week": return subWeeks(d, 1);
        case "day": return subDays(d, 1);
        default: return subMonths(d, 1);
      }
    });
  }, [view]);

  const goToday = useCallback(() => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  }, []);

  const selectDate = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const changeView = useCallback((newView: CalendarView) => {
    setView(newView);
  }, []);

  return useMemo(() => ({
    currentDate,
    selectedDate,
    view,
    goNext,
    goPrev,
    goToday,
    selectDate,
    changeView,
  }), [currentDate, selectedDate, view, goNext, goPrev, goToday, selectDate, changeView]);
}
