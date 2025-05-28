import React, { useState } from 'react';
import { useStore } from '../../contexts/StoreContext';
// import { useConfig } from '../contexts/ConfigContext';
// Update the import path below if the file exists elsewhere:
import { useConfig } from '../../contexts/ConfigContext';
import styles from './StorePage.module.scss';

const StorePage: React.FC = () => {
  const { 
    storeName,
    employees,
    selectedEmployee,
    setSelectedEmployee,
    clients,
    services,
    appointments,
    getAppointmentsByDate,
    getActiveEmployees
  } = useStore();

  const { barberShopConfig, isConfigured } = useConfig();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'employees' | 'clients' | 'services' | 'appointments'>('dashboard');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Estatísticas do dashboard
  const todayAppointments = getAppointmentsByDate(new Date());
  const activeEmployeesCount = getActiveEmployees().length;
  const activeClientsCount = clients.filter(c => c.isActive).length;
  const activeServicesCount = services.filter(s => s.isActive).length;

  const todayRevenue = todayAppointments
    .filter(apt => apt.status === 'concluido')
    .reduce((total, apt) => total + apt.totalPrice, 0);

  if (!isConfigured) {
    return (
      <div className={styles.storePage}>
        <div className={styles.notConfigured}>
          <h2>Barbearia não configurada</h2>
          <p>Configure sua barbearia primeiro para acessar o sistema</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.storePage}>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1>{barberShopConfig?.nomeEstabelecimento || storeName}</h1>
            <p>Sistema de Gerenciamento</p>
          </div>
          
          <div className={styles.employeeSelector}>
            <label>Funcionário Ativo:</label>
            <select 
              value={selectedEmployee?.id || 0}
              onChange={(e) => {
                const emp = employees.find(emp => emp.id === Number(e.target.value));
                setSelectedEmployee(emp || null);
              }}
            >
              {employees.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className={styles.navigation}>
          <button 
            className={`${styles.navButton} ${activeTab === 'dashboard' ? styles.active : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`${styles.navButton} ${activeTab === 'employees' ? styles.active : ''}`}
            onClick={() => setActiveTab('employees')}
          >
            Funcionários
          </button>
          <button 
            className={`${styles.navButton} ${activeTab === 'clients' ? styles.active : ''}`}
            onClick={() => setActiveTab('clients')}
          >
            Clientes
          </button>
          <button 
            className={`${styles.navButton} ${activeTab === 'services' ? styles.active : ''}`}
            onClick={() => setActiveTab('services')}
          >
            Serviços
          </button>
          <button 
            className={`${styles.navButton} ${activeTab === 'appointments' ? styles.active : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            Agendamentos
          </button>
        </nav>

        {/* Content Area */}
        <main className={styles.content}>
          {activeTab === 'dashboard' && (
            <div className={styles.dashboard}>
              <h2>Dashboard</h2>
              
              {/* Cards de Estatísticas */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>👥</div>
                  <div className={styles.statInfo}>
                    <h3>Funcionários Ativos</h3>
                    <span className={styles.statNumber}>{activeEmployeesCount}</span>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIcon}>👤</div>
                  <div className={styles.statInfo}>
                    <h3>Clientes Cadastrados</h3>
                    <span className={styles.statNumber}>{activeClientsCount}</span>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIcon}>✂️</div>
                  <div className={styles.statInfo}>
                    <h3>Serviços Disponíveis</h3>
                    <span className={styles.statNumber}>{activeServicesCount}</span>
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statIcon}>💰</div>
                  <div className={styles.statInfo}>
                    <h3>Faturamento Hoje</h3>
                    <span className={styles.statNumber}>R$ {todayRevenue.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Agendamentos de Hoje */}
              <div className={styles.todaySection}>
                <h3>Agendamentos de Hoje ({todayAppointments.length})</h3>
                
                {todayAppointments.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>Nenhum agendamento para hoje</p>
                  </div>
                ) : (
                  <div className={styles.appointmentsList}>
                    {todayAppointments.map(appointment => {
                      const client = clients.find(c => c.id === appointment.clientId);
                      const employee = employees.find(e => e.id === appointment.employeeId);
                      const appointmentServices = services.filter(s => 
                        appointment.serviceIds.includes(s.id)
                      );

                      return (
                        <div key={appointment.id} className={styles.appointmentCard}>
                          <div className={styles.appointmentTime}>
                            <span>{appointment.startTime}</span>
                            <span className={styles.duration}>
                              {appointmentServices.reduce((total, s) => total + s.duration, 0)}min
                            </span>
                          </div>
                          
                          <div className={styles.appointmentInfo}>
                            <h4>{client?.name || 'Cliente não encontrado'}</h4>
                            <p>Funcionário: {employee?.name}</p>
                            <p>Serviços: {appointmentServices.map(s => s.name).join(', ')}</p>
                          </div>
                          
                          <div className={styles.appointmentStatus}>
                            <span className={`${styles.status} ${styles[appointment.status]}`}>
                              {appointment.status.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className={styles.price}>R$ {appointment.totalPrice.toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'employees' && (
            <div className={styles.employeesSection}>
              <div className={styles.sectionHeader}>
                <h2>Funcionários</h2>
                <button className={styles.addButton}>+ Adicionar Funcionário</button>
              </div>
              
              <div className={styles.employeesGrid}>
                {getActiveEmployees().map(employee => (
                  <div key={employee.id} className={styles.employeeCard}>
                    <div className={styles.employeeAvatar}>
                      {employee.avatar ? (
                        <img src={employee.avatar} alt={employee.name} />
                      ) : (
                        <span>{employee.name.charAt(0)}</span>
                      )}
                    </div>
                    
                    <div className={styles.employeeInfo}>
                      <h3>{employee.name}</h3>
                      <p>{employee.email}</p>
                      <p>{employee.phone}</p>
                      
                      <div className={styles.specialties}>
                        {employee.specialties.map(specialty => (
                          <span key={specialty} className={styles.specialty}>
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className={styles.employeeActions}>
                      <button className={styles.editButton}>Editar</button>
                      <button className={styles.scheduleButton}>Ver Agenda</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'clients' && (
            <div className={styles.clientsSection}>
              <div className={styles.sectionHeader}>
                <h2>Clientes</h2>
                <button className={styles.addButton}>+ Adicionar Cliente</button>
              </div>
              
              <div className={styles.searchBar}>
                <input 
                  type="text" 
                  placeholder="Buscar cliente por nome, email ou telefone..."
                  className={styles.searchInput}
                />
              </div>

              <div className={styles.clientsList}>
                {clients.filter(c => c.isActive).map(client => (
                  <div key={client.id} className={styles.clientCard}>
                    <div className={styles.clientInfo}>
                      <h3>{client.name}</h3>
                      <p>{client.email}</p>
                      <p>{client.phone}</p>
                    </div>
                    
                    <div className={styles.clientStats}>
                      <span>Visitas: {client.totalVisits}</span>
                      {client.lastVisit && (
                        <span>Última visita: {client.lastVisit.toLocaleDateString()}</span>
                      )}
                    </div>
                    
                    <div className={styles.clientActions}>
                      <button className={styles.editButton}>Editar</button>
                      <button className={styles.historyButton}>Histórico</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className={styles.servicesSection}>
              <div className={styles.sectionHeader}>
                <h2>Serviços</h2>
                <button className={styles.addButton}>+ Adicionar Serviço</button>
              </div>
              
              <div className={styles.servicesGrid}>
                {services.filter(s => s.isActive).map(service => (
                  <div key={service.id} className={styles.serviceCard}>
                    <div className={styles.serviceHeader}>
                      <h3>{service.name}</h3>
                      <span className={styles.category}>{service.category}</span>
                    </div>
                    
                    <p className={styles.description}>{service.description}</p>
                    
                    <div className={styles.serviceDetails}>
                      <span className={styles.duration}>{service.duration} min</span>
                      <span className={styles.price}>R$ {service.price.toFixed(2)}</span>
                    </div>
                    
                    <div className={styles.serviceActions}>
                      <button className={styles.editButton}>Editar</button>
                      <button className={styles.deleteButton}>Remover</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className={styles.appointmentsSection}>
              <div className={styles.sectionHeader}>
                <h2>Agendamentos</h2>
                <button className={styles.addButton}>+ Novo Agendamento</button>
              </div>
              
              <div className={styles.dateSelector}>
                <input 
                  type="date" 
                  value={selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className={styles.dateInput}
                />
              </div>

              <div className={styles.appointmentsList}>
                {getAppointmentsByDate(selectedDate).map(appointment => {
                  const client = clients.find(c => c.id === appointment.clientId);
                  const employee = employees.find(e => e.id === appointment.employeeId);
                  const appointmentServices = services.filter(s => 
                    appointment.serviceIds.includes(s.id)
                  );

                  return (
                    <div key={appointment.id} className={styles.appointmentCard}>
                      <div className={styles.appointmentTime}>
                        <span>{appointment.startTime} - {appointment.endTime}</span>
                      </div>
                      
                      <div className={styles.appointmentDetails}>
                        <h4>{client?.name}</h4>
                        <p>Funcionário: {employee?.name}</p>
                        <p>Serviços: {appointmentServices.map(s => s.name).join(', ')}</p>
                        {appointment.notes && <p>Obs: {appointment.notes}</p>}
                      </div>
                      
                      <div className={styles.appointmentMeta}>
                        <span className={`${styles.status} ${styles[appointment.status]}`}>
                          {appointment.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={styles.price}>R$ {appointment.totalPrice.toFixed(2)}</span>
                      </div>
                      
                      <div className={styles.appointmentActions}>
                        <button className={styles.editButton}>Editar</button>
                        <button className={styles.cancelButton}>Cancelar</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StorePage;
