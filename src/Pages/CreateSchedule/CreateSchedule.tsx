import React, { useState, useEffect, useContext } from 'react';
import { useStore } from '../../contexts/StoreContext';
import { useConfig } from '../../contexts/ConfigContext';
import { UserContext } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import styles from './CreateSchedule.module.scss';

interface ScheduleForm {
  clientId: number | null;
  employeeId: number | null;
  serviceIds: number[];
  date: string;
  startTime: string;
  notes: string;
}

export default function CreateSchedule() {
  const { user } : any = useContext(UserContext);
  const navigate = useNavigate();
  
  const {
    clients,
    employees,
    services,
    selectedEmployee,
    setSelectedEmployee,
    addAppointment,
    addClient,
    calculateTotalPrice,
    getActiveEmployees,
    getActiveServices
  } = useStore();

  const { barberShopConfig, isConfigured } = useConfig();

  const [form, setForm] = useState<ScheduleForm>({
    clientId: null,
    employeeId: selectedEmployee?.id || null,
    serviceIds: [],
    date: '',
    startTime: '',
    notes: ''
  });

  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    isActive: true
  });

  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [searchClient, setSearchClient] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  // Verifica se usuário está logado
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  // Verifica se barbearia está configurada
  useEffect(() => {
    if (!isConfigured) {
      navigate("/configuration", { replace: true });
    }
  }, [isConfigured, navigate]);

  // Gera horários disponíveis baseado na configuração da barbearia
  const generateAvailableSlots = (selectedDate: string, employeeId: number) => {
    if (!selectedDate || !employeeId || !barberShopConfig) return [];

    const date = new Date(selectedDate);
    const dayName = date.toLocaleDateString('pt-BR', { weekday: 'long' }).toLowerCase();
    
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee || !employee.workSchedule[dayName]?.isWorking) return [];

    const { start, end } = employee.workSchedule[dayName];
    const slots: string[] = [];
    
    const startTime = new Date(`2000-01-01T${start}:00`);
    const endTime = new Date(`2000-01-01T${end}:00`);
    const interval = barberShopConfig.configuracoesSistema.intervaloAgendamento;

    while (startTime < endTime) {
      slots.push(startTime.toTimeString().slice(0, 5));
      startTime.setMinutes(startTime.getMinutes() + interval);
    }

    return slots;
  };

  // Atualiza horários disponíveis quando data ou funcionário mudam
  useEffect(() => {
    if (form.date && form.employeeId) {
      const slots = generateAvailableSlots(form.date, form.employeeId);
      setAvailableSlots(slots);
      setForm(prev => ({ ...prev, startTime: '' }));
    }
  }, [form.date, form.employeeId, barberShopConfig]);

  const handleFormChange = (field: keyof ScheduleForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    // Limpa erro do campo
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleServiceToggle = (serviceId: number) => {
    setForm(prev => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter(id => id !== serviceId)
        : [...prev.serviceIds, serviceId]
    }));
  };

  const handleNewClientChange = (field: string, value: string) => {
    setNewClient(prev => ({ ...prev, [field]: value }));
  };

  const handleAddNewClient = () => {
    if (!newClient.name || !newClient.email || !newClient.phone) {
      setErrors({ newClient: 'Preencha todos os campos do cliente' });
      return;
    }

    try {
      addClient(newClient);
      const clientId = Math.max(0, ...clients.map(c => c.id)) + 1;
      setForm(prev => ({ ...prev, clientId }));
      setShowNewClientForm(false);
      setNewClient({ name: '', email: '', phone: '', isActive: true });
      setErrors({});
    } catch (error) {
      setErrors({ newClient: 'Erro ao adicionar cliente' });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: any = {};

    if (!form.clientId) {
      newErrors.clientId = 'Selecione um cliente';
    }

    if (!form.employeeId) {
      newErrors.employeeId = 'Selecione um funcionário';
    }

    if (form.serviceIds.length === 0) {
      newErrors.serviceIds = 'Selecione pelo menos um serviço';
    }

    if (!form.date) {
      newErrors.date = 'Selecione uma data';
    }

    if (!form.startTime) {
      newErrors.startTime = 'Selecione um horário';
    }

    // Verifica se a data não é no passado
    if (form.date) {
      const selectedDate = new Date(form.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = 'Não é possível agendar para datas passadas';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateEndTime = (startTime: string, serviceIds: number[]): string => {
    const totalDuration = services
      .filter(service => serviceIds.includes(service.id))
      .reduce((total, service) => total + service.duration, 0);

    const start = new Date(`2000-01-01T${startTime}:00`);
    start.setMinutes(start.getMinutes() + totalDuration);
    
    return start.toTimeString().slice(0, 5);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const endTime = calculateEndTime(form.startTime, form.serviceIds);
      const totalPrice = calculateTotalPrice(form.serviceIds);

      const newAppointment = {
        clientId: form.clientId!,
        employeeId: form.employeeId!,
        serviceIds: form.serviceIds,
        date: new Date(form.date),
        startTime: form.startTime,
        endTime,
        status: 'agendado' as const,
        notes: form.notes,
        totalPrice
      };

      addAppointment(newAppointment);

      // Reset form
      setForm({
        clientId: null,
        employeeId: selectedEmployee?.id || null,
        serviceIds: [],
        date: '',
        startTime: '',
        notes: ''
      });

      alert('Agendamento criado com sucesso!');
      navigate('/store');

    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      setErrors({ submit: 'Erro ao criar agendamento' });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.isActive && (
      client.name.toLowerCase().includes(searchClient.toLowerCase()) ||
      client.email.toLowerCase().includes(searchClient.toLowerCase()) ||
      client.phone.includes(searchClient)
    )
  );

  const totalPrice = calculateTotalPrice(form.serviceIds);
  const selectedServices = services.filter(s => form.serviceIds.includes(s.id));
  const totalDuration = selectedServices.reduce((total, s) => total + s.duration, 0);

  return (
    <div className={styles.createSchedulePage}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Nova Marcação</h1>
          <p>Agende um novo atendimento para seus clientes</p>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Seleção de Cliente */}
          <section className={styles.section}>
            <h2>Cliente</h2>
            
            <div className={styles.clientSelection}>
              <div className={styles.searchContainer}>
                <input
                  type="text"
                  placeholder="Buscar cliente por nome, email ou telefone..."
                  value={searchClient}
                  onChange={(e) => setSearchClient(e.target.value)}
                  className={styles.searchInput}
                />
                <button
                  type="button"
                  onClick={() => setShowNewClientForm(!showNewClientForm)}
                  className={styles.newClientButton}
                >
                  + Novo Cliente
                </button>
              </div>

              {showNewClientForm && (
                <div className={styles.newClientForm}>
                  <h3>Adicionar Novo Cliente</h3>
                  <div className={styles.clientInputs}>
                    <input
                      type="text"
                      placeholder="Nome completo"
                      value={newClient.name}
                      onChange={(e) => handleNewClientChange('name', e.target.value)}
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={newClient.email}
                      onChange={(e) => handleNewClientChange('email', e.target.value)}
                    />
                    <input
                      type="tel"
                      placeholder="Telefone"
                      value={newClient.phone}
                      onChange={(e) => handleNewClientChange('phone', e.target.value)}
                    />
                  </div>
                  <div className={styles.clientActions}>
                    <button type="button" onClick={handleAddNewClient} className={styles.addButton}>
                      Adicionar
                    </button>
                    <button type="button" onClick={() => setShowNewClientForm(false)} className={styles.cancelButton}>
                      Cancelar
                    </button>
                  </div>
                  {errors.newClient && <span className={styles.errorMessage}>{errors.newClient}</span>}
                </div>
              )}

              <div className={styles.clientsList}>
                {filteredClients.map(client => (
                  <div
                    key={client.id}
                    className={`${styles.clientCard} ${form.clientId === client.id ? styles.selected : ''}`}
                    onClick={() => handleFormChange('clientId', client.id)}
                  >
                    <div className={styles.clientInfo}>
                      <h4>{client.name}</h4>
                      <p>{client.email}</p>
                      <p>{client.phone}</p>
                    </div>
                    <div className={styles.clientStats}>
                      <span>{client.totalVisits} visitas</span>
                    </div>
                  </div>
                ))}
              </div>
              {errors.clientId && <span className={styles.errorMessage}>{errors.clientId}</span>}
            </div>
          </section>

          {/* Seleção de Funcionário */}
          <section className={styles.section}>
            <h2>Funcionário</h2>
            <div className={styles.employeeSelection}>
              {getActiveEmployees().map(employee => (
                <div
                  key={employee.id}
                  className={`${styles.employeeCard} ${form.employeeId === employee.id ? styles.selected : ''}`}
                  onClick={() => handleFormChange('employeeId', employee.id)}
                >
                  <div className={styles.employeeAvatar}>
                    {employee.name.charAt(0)}
                  </div>
                  <div className={styles.employeeInfo}>
                    <h4>{employee.name}</h4>
                    <div className={styles.specialties}>
                      {employee.specialties.map(specialty => (
                        <span key={specialty} className={styles.specialty}>
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {errors.employeeId && <span className={styles.errorMessage}>{errors.employeeId}</span>}
          </section>

          {/* Seleção de Serviços */}
          <section className={styles.section}>
            <h2>Serviços</h2>
            <div className={styles.servicesSelection}>
              {getActiveServices().map(service => (
                <div
                  key={service.id}
                  className={`${styles.serviceCard} ${form.serviceIds.includes(service.id) ? styles.selected : ''}`}
                  onClick={() => handleServiceToggle(service.id)}
                >
                  <div className={styles.serviceHeader}>
                    <h4>{service.name}</h4>
                    <span className={styles.category}>{service.category}</span>
                  </div>
                  <p className={styles.description}>{service.description}</p>
                  <div className={styles.serviceDetails}>
                    <span className={styles.duration}>{service.duration} min</span>
                    <span className={styles.price}>R$ {service.price.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
            {errors.serviceIds && <span className={styles.errorMessage}>{errors.serviceIds}</span>}
          </section>

          {/* Seleção de Data e Horário */}
          <section className={styles.section}>
            <h2>Data e Horário</h2>
            
            <div className={styles.dateTimeSelection}>
              <div className={styles.dateInput}>
                <label>Data</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => handleFormChange('date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={errors.date ? styles.inputError : ''}
                />
                {errors.date && <span className={styles.errorMessage}>{errors.date}</span>}
              </div>

              {availableSlots.length > 0 && (
                <div className={styles.timeSlots}>
                  <label>Horário Disponível</label>
                  <div className={styles.slotsGrid}>
                    {availableSlots.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        className={`${styles.timeSlot} ${form.startTime === slot ? styles.selected : ''}`}
                        onClick={() => handleFormChange('startTime', slot)}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                  {errors.startTime && <span className={styles.errorMessage}>{errors.startTime}</span>}
                </div>
              )}
            </div>
          </section>

          {/* Observações */}
          <section className={styles.section}>
            <h2>Observações</h2>
            <textarea
              placeholder="Observações adicionais sobre o atendimento..."
              value={form.notes}
              onChange={(e) => handleFormChange('notes', e.target.value)}
              className={styles.notesInput}
              rows={4}
            />
          </section>

          {/* Resumo do Agendamento */}
          {form.serviceIds.length > 0 && (
            <section className={styles.summary}>
              <h2>Resumo do Agendamento</h2>
              <div className={styles.summaryContent}>
                <div className={styles.summaryItem}>
                  <span>Serviços:</span>
                  <span>{selectedServices.map(s => s.name).join(', ')}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span>Duração Total:</span>
                  <span>{totalDuration} minutos</span>
                </div>
                <div className={styles.summaryItem}>
                  <span>Valor Total:</span>
                  <span className={styles.totalPrice}>R$ {totalPrice.toFixed(2)}</span>
                </div>
                {form.startTime && (
                  <div className={styles.summaryItem}>
                    <span>Horário:</span>
                    <span>{form.startTime} - {calculateEndTime(form.startTime, form.serviceIds)}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Botões de Ação */}
          <div className={styles.actionButtons}>
            <button
              type="button"
              onClick={() => navigate('/store')}
              className={styles.cancelButton}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={styles.submitButton}
            >
              {isLoading ? 'Criando...' : 'Criar Agendamento'}
            </button>
          </div>

          {errors.submit && (
            <div className={styles.submitError}>
              {errors.submit}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
