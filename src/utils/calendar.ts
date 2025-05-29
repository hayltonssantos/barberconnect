// src/utils/calendar.ts
import dayjs, { Dayjs } from 'dayjs';

export const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const daysOfWeek = [
  'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'
];

export const daysOfWeekShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export interface CalendarDay {
  date: Dayjs;
  currentMonth: boolean;
  today: boolean;
}

export const generateDate = (month: number = dayjs().month(), year: number = dayjs().year()): CalendarDay[] => {
  const firstDateOfMonth = dayjs().year(year).month(month).startOf('month');
  const lastDateOfMonth = dayjs().year(year).month(month).endOf('month');

  const arrayOfDate: CalendarDay[] = [];

  // Criar dias do mês anterior para preencher o calendário
  for (let i = 0; i < firstDateOfMonth.day(); i++) {
    const date = firstDateOfMonth.day(i);
    arrayOfDate.push({
      date,
      currentMonth: false,
      today: date.toDateString() === dayjs().toDateString(),
    });
  }

  // Criar dias do mês atual
  for (let i = firstDateOfMonth.date(); i <= lastDateOfMonth.date(); i++) {
    const date = firstDateOfMonth.date(i);
    arrayOfDate.push({
      date,
      currentMonth: true,
      today: date.toDateString() === dayjs().toDateString(),
    });
  }

  // Criar dias do próximo mês para preencher o calendário
  const remaining = 42 - arrayOfDate.length;
  for (let i = lastDateOfMonth.date() + 1; i <= lastDateOfMonth.date() + remaining; i++) {
    const date = lastDateOfMonth.date(i);
    arrayOfDate.push({
      date,
      currentMonth: false,
      today: date.toDateString() === dayjs().toDateString(),
    });
  }

  return arrayOfDate;
};
