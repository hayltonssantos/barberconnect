import React, { useState, useMemo } from 'react';
import { generateDate, months } from '../../util/calendar';
import cn from '../../util/cn';
import { GrFormNext, GrFormPrevious } from 'react-icons/gr';
import { Table } from 'react-bootstrap';
import { useDate } from '../../contexts/DateContext';
import { useStore } from '../../contexts/StoreContext';
import { useConfig } from '../../contexts/ConfigContext';
import styles from './Calendar.module.scss';
import dayjs from 'dayjs';

interface CalendarProps {
  showSchedule?: boolean;
  showCalendar?: boolean;
  onDateSelect?: (date: any) => void;
  onAppointmentClick?: (appointment: any) => void;
}

interface Appointment {
  id: number;
  clientId: number;
  employeeId: number;
  serviceIds: number[];
  date: Date;
  startTime: string;
  endTime: string;
  status: 'agendado' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado';
  notes?: string;
  totalPrice: number;
}

export default function Calendar({ 
  showSchedule = false, 
  showCalendar = true,
  onDateSelect,
  onAppointmentClick
}: CalendarProps) {
  
  const days = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const daysFull = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  const { 
    today, 
    selectedDate, 
    setSelectedDate, 
    setToday, 
    currentDate,
    formatDate,
    formatTime,
    isToday,
    isSameDay
  } = useDate();

  const { 
    selectedEmployee, 
    appointments, 
    clients, 
    employees, 
    services,
    getAppointmentsByDate,
    getAppointmentsByEmployee
  } = useStore();

  const { barberShopConfig } = useConfig();

  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  // Filtra agendamentos baseado no funcionário selecionado e data
  const filteredAppointments = useMemo(() => {
    let filtered = getAppointmentsByDate(selectedDate.toDate());
    
    if (selectedEmployee && selectedEmployee.id !== 0) {
      filtered = filtered.filter(apt => apt.employeeId === selectedEmployee.id);
    }
    
    return filtered.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [selectedDate, selectedEmployee, appointments, getAppointmentsByDate]);

  // Conta agendamentos por data para mostrar indicadores no calendário
  const appointmentsByDate = useMemo(() => {
    const dateMap = new Map();
    


    appointments.forEach(appointment => {
      const dateKey = formatDate(dayjs(appointment.date), 'YYYY-MM-DD');
      const current = dateMap.get(dateKey) || 0;
      
      // Filtra por funcionário se selecionado
      if (!selectedEmployee || selectedEmployee.id === 0 || appointment.employeeId === selectedEmployee.id) {
        dateMap.set(dateKey, current + 1);
      }
    });
    
    return dateMap;
  }, [appointments, selectedEmployee, formatDate]);

  const handleDateClick = (date: any) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    onAppointmentClick?.(appointment);
  };

  const getAppointmentStatusColor = (status: string) => {
    const colors = {
      agendado: '#ed8936',
      confirmado: '#48bb78',
      em_andamento: '#00bcd4',
      concluido: '#38a169',
      cancelado: '#e53e3e'
    };
    return colors[status as keyof typeof colors] || '#gray';
  };

  const renderSchedule = () => {
    if (!showSchedule) return null;

    return (
      <div className={styles.schedule}>
        <div className={styles.scheduleHeader}>
          <h2 className={styles.scheduleTitle}>
            Agendamentos para {formatDate(selectedDate, 'DD [de] MMMM [de] YYYY')}
          </h2>
          <div className={styles.scheduleInfo}>
            <span className={styles.dayOfWeek}>
              {daysFull[selectedDate.day()]}
            </span>
            {selectedEmployee && selectedEmployee.id !== 0 && (
              <span className={styles.employeeFilter}>
                Funcionário: {selectedEmployee.name}
              </span>
            )}
          </div>
        </div>

        <div className={styles.appointmentsList}>
          {filteredAppointments.length === 0 ? (
            <div className={styles.noAppointments}>
              <div className={styles.emptyIcon}>📅</div>
              <h3>Nenhum agendamento</h3>
              <p>Não há agendamentos para esta data</p>
            </div>
          ) : (
            <Table striped hover className={styles.appointmentsTable}>
              <thead>
                <tr>
                  <th>Horário</th>
                  <th>Cliente</th>
                  <th>Funcionário</th>
                  <th>Serviços</th>
                  <th>Status</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment) => {
                  const client = clients.find(c => c.id === appointment.clientId);
                  const employee = employees.find(e => e.id === appointment.employeeId);
                  const appointmentServices = services.filter(s => 
                    appointment.serviceIds.includes(s.id)
                  );

                  return (
                    <tr 
                      key={appointment.id} 
                      className={styles.appointmentRow}
                      onClick={() => handleAppointmentClick(appointment)}
                    >
                      <td className={styles.timeCell}>
                        <div className={styles.timeRange}>
                          <span className={styles.startTime}>{appointment.startTime}</span>
                          <span className={styles.endTime}>{appointment.endTime}</span>
                        </div>
                      </td>
                      <td className={styles.clientCell}>
                        <div className={styles.clientInfo}>
                          <span className={styles.clientName}>{client?.name || 'Cliente não encontrado'}</span>
                          <span className={styles.clientPhone}>{client?.phone}</span>
                        </div>
                      </td>
                      <td className={styles.employeeCell}>
                        {employee?.name || 'Funcionário não encontrado'}
                      </td>
                      <td className={styles.servicesCell}>
                        <div className={styles.servicesList}>
                          {appointmentServices.map(service => (
                            <span key={service.id} className={styles.serviceTag}>
                              {service.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className={styles.statusCell}>
                        <span 
                          className={styles.statusBadge}
                          style={{ backgroundColor: getAppointmentStatusColor(appointment.status) }}
                        >
                          {appointment.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className={styles.priceCell}>
                        R$ {appointment.totalPrice.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    if (!showCalendar) return null;

    return (
      <div className={styles.calendar}>
        <div className={styles.calendarHeader}>
          <h1 className={styles.monthYear}>
            {months[today.month()]}, {today.year()}
          </h1>
          
          <div className={styles.calendarControls}>
            <button
              className={styles.navButton}
              onClick={() => setToday(today.month(today.month() - 1))}
              aria-label="Mês anterior"
            >
              <GrFormPrevious />
            </button>
            
            <button
              className={styles.todayButton}
              onClick={() => {
                setSelectedDate(currentDate);
                setToday(currentDate);
              }}
            >
              Hoje
            </button>
            
            <button
              className={styles.navButton}
              onClick={() => setToday(today.month(today.month() + 1))}
              aria-label="Próximo mês"
            >
              <GrFormNext />
            </button>
          </div>
        </div>

        <div className={styles.weekDays}>
          {days.map((day, index) => (
            <div key={index} className={styles.weekDay}>
              {day}
            </div>
          ))}
        </div>

        <div className={styles.datesGrid}>
          {generateDate(today.month(), today.year()).map(({ date, currentMonth, today: isCurrentDay }, index) => {
            const dateKey = formatDate(date, 'YYYY-MM-DD');
            const appointmentCount = appointmentsByDate.get(dateKey) || 0;
            const isSelected = isSameDay(selectedDate, date);
            const isTodayDate = isToday(date);

            return (
              <div
                key={index}
                className={cn(
                  styles.dateCell,
                  !currentMonth && styles.otherMonth,
                  isTodayDate && styles.today,
                  isSelected && styles.selected,
                  appointmentCount > 0 && styles.hasAppointments
                )}
                onClick={() => handleDateClick(date)}
              >
                <span className={styles.dateNumber}>
                  {date.date()}
                </span>
                
                {appointmentCount > 0 && (
                  <div className={styles.appointmentIndicator}>
                    <span className={styles.appointmentCount}>
                      {appointmentCount}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.calendarContainer}>
      {renderCalendar()}
      {renderSchedule()}
    </div>
  );
}
