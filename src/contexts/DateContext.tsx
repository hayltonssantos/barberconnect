// src/contexts/DateContext.tsx
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/pt-br';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import advancedFormat from 'dayjs/plugin/advancedFormat';

// Configurar plugins do dayjs
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.locale('pt-br');

interface DateContextType {
  // Estados básicos
  today: Dayjs;
  selectedDate: Dayjs;
  currentDate: Dayjs;
  
  // Setters
  setToday: (date: Dayjs) => void;
  setSelectedDate: (date: Dayjs) => void;
  
  // Funções utilitárias
  formatDate: (date: Dayjs | Date | string, format?: string) => string;
  formatTime: (date: Dayjs | Date | string, format?: string) => string;
  formatDateTime: (date: Dayjs | Date | string, format?: string) => string;
  formatRelative: (date: Dayjs | Date | string) => string;
  
  // Funções de validação
  isToday: (date: Dayjs | Date | string) => boolean;
  isPast: (date: Dayjs | Date | string) => boolean;
  isFuture: (date: Dayjs | Date | string) => boolean;
  isWeekend: (date: Dayjs | Date | string) => boolean;
  isWorkingDay: (date: Dayjs | Date | string, workingDays?: string[]) => boolean;
  
  // Funções de manipulação
  addDays: (date: Dayjs, days: number) => Dayjs;
  addWeeks: (date: Dayjs, weeks: number) => Dayjs;
  addMonths: (date: Dayjs, months: number) => Dayjs;
  subtractDays: (date: Dayjs, days: number) => Dayjs;
  
  // Funções específicas para agendamentos
  getWeekDays: (startDate?: Dayjs) => Dayjs[];
  getMonthDays: (date?: Dayjs) => Dayjs[];
  getAvailableDates: (startDate: Dayjs, endDate: Dayjs, workingDays?: string[]) => Dayjs[];
  getTimeSlots: (date: Dayjs, startTime: string, endTime: string, interval: number) => string[];
  
  // Funções de comparação
  isSameDay: (date1: Dayjs | Date | string, date2: Dayjs | Date | string) => boolean;
  isSameWeek: (date1: Dayjs | Date | string, date2: Dayjs | Date | string) => boolean;
  isSameMonth: (date1: Dayjs | Date | string, date2: Dayjs | Date | string) => boolean;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

interface DateProviderProps {
  children: ReactNode;
}

export const DateProvider: React.FC<DateProviderProps> = ({ children }) => {
  const currentDate = dayjs();
  const [today, setToday] = useState<Dayjs>(currentDate);
  const [selectedDate, setSelectedDate] = useState<Dayjs>(currentDate);

  // Função helper para garantir que sempre trabalhamos com objetos dayjs
  const ensureDayjs = useCallback((date: Dayjs | Date | string): Dayjs => {
    if (dayjs.isDayjs(date)) {
      return date;
    }
    return dayjs(date);
  }, []);

  // Funções de formatação
  const formatDate = useCallback((date: Dayjs | Date | string, format: string = 'DD/MM/YYYY'): string => {
    const dayjsDate = ensureDayjs(date);
    return dayjsDate.format(format);
  }, [ensureDayjs]);

  const formatTime = useCallback((date: Dayjs | Date | string, format: string = 'HH:mm'): string => {
    const dayjsDate = ensureDayjs(date);
    return dayjsDate.format(format);
  }, [ensureDayjs]);

  const formatDateTime = useCallback((date: Dayjs | Date | string, format: string = 'DD/MM/YYYY HH:mm'): string => {
    const dayjsDate = ensureDayjs(date);
    return dayjsDate.format(format);
  }, [ensureDayjs]);

  const formatRelative = useCallback((date: Dayjs | Date | string): string => {
    const dayjsDate = ensureDayjs(date);
    const now = dayjs();
    const diffDays = dayjsDate.diff(now, 'day');
    
    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Amanhã';
    if (diffDays === -1) return 'Ontem';
    if (diffDays > 1 && diffDays <= 7) return `Em ${diffDays} dias`;
    if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} dias atrás`;
    
    return dayjsDate.format('DD/MM/YYYY');
  }, [ensureDayjs]);

  // Funções de validação
  const isToday = useCallback((date: Dayjs | Date | string): boolean => {
    const dayjsDate = ensureDayjs(date);
    return dayjsDate.isSame(dayjs(), 'day');
  }, [ensureDayjs]);

  const isPast = useCallback((date: Dayjs | Date | string): boolean => {
    const dayjsDate = ensureDayjs(date);
    return dayjsDate.isBefore(dayjs(), 'day');
  }, [ensureDayjs]);

  const isFuture = useCallback((date: Dayjs | Date | string): boolean => {
    const dayjsDate = ensureDayjs(date);
    return dayjsDate.isAfter(dayjs(), 'day');
  }, [ensureDayjs]);

  const isWeekend = useCallback((date: Dayjs | Date | string): boolean => {
    const dayjsDate = ensureDayjs(date);
    const dayOfWeek = dayjsDate.day();
    return dayOfWeek === 0 || dayOfWeek === 6; // Domingo = 0, Sábado = 6
  }, [ensureDayjs]);

  const isWorkingDay = useCallback((date: Dayjs | Date | string, workingDays: string[] = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']): boolean => {
    const dayjsDate = ensureDayjs(date);
    const dayNames = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
    const dayName = dayNames[dayjsDate.day()];
    return workingDays.includes(dayName);
  }, [ensureDayjs]);

  // Funções de manipulação
  const addDays = useCallback((date: Dayjs, days: number): Dayjs => {
    return date.add(days, 'day');
  }, []);

  const addWeeks = useCallback((date: Dayjs, weeks: number): Dayjs => {
    return date.add(weeks, 'week');
  }, []);

  const addMonths = useCallback((date: Dayjs, months: number): Dayjs => {
    return date.add(months, 'month');
  }, []);

  const subtractDays = useCallback((date: Dayjs, days: number): Dayjs => {
    return date.subtract(days, 'day');
  }, []);

  // Funções específicas para agendamentos
  const getWeekDays = useCallback((startDate: Dayjs = dayjs()): Dayjs[] => {
    const startOfWeek = startDate.startOf('week');
    const days: Dayjs[] = [];
    
    for (let i = 0; i < 7; i++) {
      days.push(startOfWeek.add(i, 'day'));
    }
    
    return days;
  }, []);

  const getMonthDays = useCallback((date: Dayjs = dayjs()): Dayjs[] => {
    const startOfMonth = date.startOf('month');
    const endOfMonth = date.endOf('month');
    const days: Dayjs[] = [];
    
    let currentDay = startOfMonth;
    while (currentDay.isSameOrBefore(endOfMonth, 'day')) {
      days.push(currentDay);
      currentDay = currentDay.add(1, 'day');
    }
    
    return days;
  }, []);

  const getAvailableDates = useCallback((
    startDate: Dayjs, 
    endDate: Dayjs, 
    workingDays: string[] = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
  ): Dayjs[] => {
    const dates: Dayjs[] = [];
    let currentDate = startDate;
    
    while (currentDate.isSameOrBefore(endDate, 'day')) {
      if (isWorkingDay(currentDate, workingDays) && !isPast(currentDate)) {
        dates.push(currentDate);
      }
      currentDate = currentDate.add(1, 'day');
    }
    
    return dates;
  }, [isWorkingDay, isPast]);

  const getTimeSlots = useCallback((
    date: Dayjs, 
    startTime: string, 
    endTime: string, 
    interval: number = 30
  ): string[] => {
    const slots: string[] = [];
    const start = dayjs(`${date.format('YYYY-MM-DD')} ${startTime}`, 'YYYY-MM-DD HH:mm');
    const end = dayjs(`${date.format('YYYY-MM-DD')} ${endTime}`, 'YYYY-MM-DD HH:mm');
    
    let current = start;
    while (current.isBefore(end)) {
      slots.push(current.format('HH:mm'));
      current = current.add(interval, 'minute');
    }
    
    return slots;
  }, []);

  // Funções de comparação
  const isSameDay = useCallback((date1: Dayjs | Date | string, date2: Dayjs | Date | string): boolean => {
    const dayjs1 = ensureDayjs(date1);
    const dayjs2 = ensureDayjs(date2);
    return dayjs1.isSame(dayjs2, 'day');
  }, [ensureDayjs]);

  const isSameWeek = useCallback((date1: Dayjs | Date | string, date2: Dayjs | Date | string): boolean => {
    const dayjs1 = ensureDayjs(date1);
    const dayjs2 = ensureDayjs(date2);
    return dayjs1.isSame(dayjs2, 'week');
  }, [ensureDayjs]);

  const isSameMonth = useCallback((date1: Dayjs | Date | string, date2: Dayjs | Date | string): boolean => {
    const dayjs1 = ensureDayjs(date1);
    const dayjs2 = ensureDayjs(date2);
    return dayjs1.isSame(dayjs2, 'month');
  }, [ensureDayjs]);

  const value: DateContextType = {
    // Estados básicos
    today,
    selectedDate,
    currentDate,
    
    // Setters
    setToday,
    setSelectedDate,
    
    // Funções utilitárias
    formatDate,
    formatTime,
    formatDateTime,
    formatRelative,
    
    // Funções de validação
    isToday,
    isPast,
    isFuture,
    isWeekend,
    isWorkingDay,
    
    // Funções de manipulação
    addDays,
    addWeeks,
    addMonths,
    subtractDays,
    
    // Funções específicas para agendamentos
    getWeekDays,
    getMonthDays,
    getAvailableDates,
    getTimeSlots,
    
    // Funções de comparação
    isSameDay,
    isSameWeek,
    isSameMonth
  };

  return (
    <DateContext.Provider value={value}>
      {children}
    </DateContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useDate = (): DateContextType => {
  const context = useContext(DateContext);
  if (!context) {
    throw new Error('useDate deve ser usado dentro de um DateProvider');
  }
  return context;
};

export { DateContext };
