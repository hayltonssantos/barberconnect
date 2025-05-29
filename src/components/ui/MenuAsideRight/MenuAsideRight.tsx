import React, { ReactNode } from 'react';
import { useStore } from '../../../contexts/StoreContext';
import { useConfig } from '../../../contexts/ConfigContext';
import { useDate } from '../../../contexts/DateContext';
import styles from './MenuAsideRight.module.scss';

interface MenuAsideRightProps {
  children?: ReactNode;
  title?: string;
  showQuickStats?: boolean;
}

interface QuickStatProps {
  icon: string;
  label: string;
  value: string | number;
  color?: string;
}

const QuickStat: React.FC<QuickStatProps> = ({ icon, label, value, color = '#b9954a' }) => (
  <div className={styles.quickStat}>
    <div className={styles.statIcon} style={{ color }}>
      {icon}
    </div>
    <div className={styles.statInfo}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
    </div>
  </div>
);

export default function MenuAsideRight({ 
  children, 
  title = "Informações",
  showQuickStats = true 
}: MenuAsideRightProps) {
  const { 
    storeName, 
    appointments, 
    clients, 
    employees, 
    getActiveEmployees,
    selectedEmployee 
  } = useStore();
  
  const { barberShopConfig } = useConfig();
  const { formatDate, isToday } = useDate();

  // Estatísticas rápidas
  const todayAppointments = appointments.filter(apt => 
    isToday(apt.date) && 
    (!selectedEmployee || selectedEmployee.id === 0 || apt.employeeId === selectedEmployee.id)
  );

  const todayRevenue = todayAppointments
    .filter(apt => apt.status === 'concluido')
    .reduce((total, apt) => total + apt.totalPrice, 0);

  const nextAppointment = appointments
    .filter(apt => 
      apt.date >= new Date() && 
      apt.status === 'agendado' &&
      (!selectedEmployee || selectedEmployee.id === 0 || apt.employeeId === selectedEmployee.id)
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const activeEmployeesCount = getActiveEmployees().length;
  const activeClientsCount = clients.filter(c => c.isActive).length;

  const displayName = barberShopConfig?.nomeEstabelecimento || storeName;

  return (
    <aside className={styles.menuAside}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.shopInfo}>
          <span className={styles.shopName}>{displayName}</span>
          <span className={styles.currentDate}>
            {formatDate(new Date(), 'dddd, DD [de] MMMM')}
          </span>
        </div>
      </div>

      {showQuickStats && (
        <div className={styles.quickStats}>
          <h4 className={styles.sectionTitle}>Resumo do Dia</h4>
          
          <div className={styles.statsGrid}>
            <QuickStat
              icon="📅"
              label="Agendamentos Hoje"
              value={todayAppointments.length}
              color="#00bcd4"
            />
            
            <QuickStat
              icon="💰"
              label="Faturamento"
              value={`R$ ${todayRevenue.toFixed(2)}`}
              color="#48bb78"
            />
            
            <QuickStat
              icon="👥"
              label="Funcionários"
              value={activeEmployeesCount}
              color="#ed8936"
            />
            
            <QuickStat
              icon="👤"
              label="Clientes"
              value={activeClientsCount}
              color="#9f7aea"
            />
          </div>

          {nextAppointment && (
            <div className={styles.nextAppointment}>
              <h5 className={styles.nextTitle}>Próximo Agendamento</h5>
              <div className={styles.appointmentCard}>
                <div className={styles.appointmentTime}>
                  {nextAppointment.startTime}
                </div>
                <div className={styles.appointmentInfo}>
                  <span className={styles.clientName}>
                    {clients.find(c => c.id === nextAppointment.clientId)?.name || 'Cliente'}
                  </span>
                  <span className={styles.employeeName}>
                    {employees.find(e => e.id === nextAppointment.employeeId)?.name || 'Funcionário'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className={styles.content}>
        {children}
      </div>

      <div className={styles.footer}>
        <div className={styles.workingHours}>
          <h5 className={styles.footerTitle}>Horário de Funcionamento</h5>
          {barberShopConfig?.horarioFuncionamento ? (
            <div className={styles.hours}>
              <span>{barberShopConfig.horarioFuncionamento.abertura} - {barberShopConfig.horarioFuncionamento.fechamento}</span>
              <span className={styles.workingDays}>
                {barberShopConfig.horarioFuncionamento.diasFuncionamento.join(', ')}
              </span>
            </div>
          ) : (
            <span className={styles.noInfo}>Não configurado</span>
          )}
        </div>

        {barberShopConfig?.telefone && (
          <div className={styles.contact}>
            <h5 className={styles.footerTitle}>Contato</h5>
            <span className={styles.phone}>{barberShopConfig.telefone}</span>
          </div>
        )}
      </div>
    </aside>
  );
}
