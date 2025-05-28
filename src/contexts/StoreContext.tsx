import { createContext, useContext, useMemo, useState, useCallback, ReactNode } from 'react';

interface Employee {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  specialties: string[];
  workSchedule: {
    [key: string]: {
      start: string;
      end: string;
      isWorking: boolean;
    };
  };
  isActive: boolean;
  avatar?: string;
}

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  lastVisit?: Date;
  totalVisits: number;
  preferences?: string[];
  isActive: boolean;
}

interface Service {
  id: number;
  name: string;
  description: string;
  duration: number; // em minutos
  price: number;
  category: string;
  isActive: boolean;
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

interface StoreContextType {
  storeName: string;
  
  // Funcionários
  employees: Employee[];
  selectedEmployee: Employee | null;
  activeEmployee: Employee | null;
  setSelectedEmployee: (employee: Employee | null) => void;
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: number, updates: Partial<Employee>) => void;
  removeEmployee: (id: number) => void;
  getActiveEmployees: () => Employee[];
  
  // Clientes
  clients: Client[];
  selectedClient: Client | null;
  setSelectedClient: (client: Client | null) => void;
  addClient: (client: Omit<Client, 'id' | 'totalVisits'>) => void;
  updateClient: (id: number, updates: Partial<Client>) => void;
  removeClient: (id: number) => void;
  searchClients: (query: string) => Client[];
  
  // Serviços
  services: Service[];
  selectedServices: Service[];
  setSelectedServices: (services: Service[]) => void;
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (id: number, updates: Partial<Service>) => void;
  removeService: (id: number) => void;
  getActiveServices: () => Service[];
  calculateTotalPrice: (serviceIds: number[]) => number;
  
  // Agendamentos
  appointments: Appointment[];
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  updateAppointment: (id: number, updates: Partial<Appointment>) => void;
  cancelAppointment: (id: number) => void;
  getAppointmentsByDate: (date: Date) => Appointment[];
  getAppointmentsByEmployee: (employeeId: number) => Appointment[];
  getAppointmentsByClient: (clientId: number) => Appointment[];
}

const defaultEmployee: Employee = {
  id: 0,
  name: 'Todos os Funcionários',
  specialties: [],
  workSchedule: {},
  isActive: true
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

interface StoreProviderProps {
  children: ReactNode;
}

const StoreProvider = ({ children }: StoreProviderProps) => {
  const storeName = 'Barber Shop';

  // Estado dos Funcionários
  const [employees] = useState<Employee[]>([
    defaultEmployee,
    {
      id: 1,
      name: 'João Silva',
      email: 'joao@barbershop.com',
      phone: '(11) 99999-1111',
      specialties: ['Corte Masculino', 'Barba', 'Bigode'],
      workSchedule: {
        segunda: { start: '08:00', end: '18:00', isWorking: true },
        terça: { start: '08:00', end: '18:00', isWorking: true },
        quarta: { start: '08:00', end: '18:00', isWorking: true },
        quinta: { start: '08:00', end: '18:00', isWorking: true },
        sexta: { start: '08:00', end: '18:00', isWorking: true },
        sábado: { start: '08:00', end: '16:00', isWorking: true },
        domingo: { start: '00:00', end: '00:00', isWorking: false }
      },
      isActive: true
    },
    {
      id: 2,
      name: 'Pedro Santos',
      email: 'pedro@barbershop.com',
      phone: '(11) 99999-2222',
      specialties: ['Corte Feminino', 'Coloração', 'Escova'],
      workSchedule: {
        segunda: { start: '09:00', end: '17:00', isWorking: true },
        terça: { start: '09:00', end: '17:00', isWorking: true },
        quarta: { start: '09:00', end: '17:00', isWorking: true },
        quinta: { start: '09:00', end: '17:00', isWorking: true },
        sexta: { start: '09:00', end: '17:00', isWorking: true },
        sábado: { start: '09:00', end: '15:00', isWorking: true },
        domingo: { start: '00:00', end: '00:00', isWorking: false }
      },
      isActive: true
    },
    {
      id: 3,
      name: 'Carlos Oliveira',
      email: 'carlos@barbershop.com',
      phone: '(11) 99999-3333',
      specialties: ['Corte Masculino', 'Barba', 'Tratamentos'],
      workSchedule: {
        segunda: { start: '10:00', end: '19:00', isWorking: true },
        terça: { start: '10:00', end: '19:00', isWorking: true },
        quarta: { start: '00:00', end: '00:00', isWorking: false },
        quinta: { start: '10:00', end: '19:00', isWorking: true },
        sexta: { start: '10:00', end: '19:00', isWorking: true },
        sábado: { start: '10:00', end: '16:00', isWorking: true },
        domingo: { start: '10:00', end: '14:00', isWorking: true }
      },
      isActive: true
    }
  ]);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(defaultEmployee);

  // Estado dos Clientes
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Estado dos Serviços
  const [services] = useState<Service[]>([
    {
      id: 1,
      name: 'Corte Masculino',
      description: 'Corte de cabelo masculino tradicional',
      duration: 30,
      price: 25.00,
      category: 'Corte',
      isActive: true
    },
    {
      id: 2,
      name: 'Barba',
      description: 'Aparar e modelar barba',
      duration: 20,
      price: 15.00,
      category: 'Barba',
      isActive: true
    },
    {
      id: 3,
      name: 'Corte + Barba',
      description: 'Pacote completo corte e barba',
      duration: 45,
      price: 35.00,
      category: 'Pacote',
      isActive: true
    },
    {
      id: 4,
      name: 'Coloração',
      description: 'Coloração completa do cabelo',
      duration: 90,
      price: 80.00,
      category: 'Coloração',
      isActive: true
    }
  ]);

  const [selectedServices, setSelectedServices] = useState<Service[]>([]);

  // Estado dos Agendamentos
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Funções dos Funcionários
  const activeEmployee = useMemo(() => {
    if (selectedEmployee?.id === 0) return null;
    return selectedEmployee;
  }, [selectedEmployee]);

  const getActiveEmployees = useCallback(() => {
    return employees.filter(emp => emp.isActive && emp.id !== 0);
  }, [employees]);

  const addEmployee = useCallback((employee: Omit<Employee, 'id'>) => {
    const newId = Math.max(...employees.map(e => e.id)) + 1;
    const newEmployee = { ...employee, id: newId };
    // setEmployees(prev => [...prev, newEmployee]);
  }, [employees]);

  const updateEmployee = useCallback((id: number, updates: Partial<Employee>) => {
    // setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, ...updates } : emp));
  }, []);

  const removeEmployee = useCallback((id: number) => {
    // setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, isActive: false } : emp));
  }, []);

  // Funções dos Clientes
  const addClient = useCallback((client: Omit<Client, 'id' | 'totalVisits'>) => {
    const newId = Math.max(0, ...clients.map(c => c.id)) + 1;
    const newClient = { ...client, id: newId, totalVisits: 0 };
    setClients(prev => [...prev, newClient]);
  }, [clients]);

  const updateClient = useCallback((id: number, updates: Partial<Client>) => {
    setClients(prev => prev.map(client => client.id === id ? { ...client, ...updates } : client));
  }, []);

  const removeClient = useCallback((id: number) => {
    setClients(prev => prev.map(client => client.id === id ? { ...client, isActive: false } : client));
  }, []);

  const searchClients = useCallback((query: string) => {
    return clients.filter(client => 
      client.name.toLowerCase().includes(query.toLowerCase()) ||
      client.email.toLowerCase().includes(query.toLowerCase()) ||
      client.phone.includes(query)
    );
  }, [clients]);

  // Funções dos Serviços
  const getActiveServices = useCallback(() => {
    return services.filter(service => service.isActive);
  }, [services]);

  const addService = useCallback((service: Omit<Service, 'id'>) => {
    const newId = Math.max(...services.map(s => s.id)) + 1;
    const newService = { ...service, id: newId };
    // setServices(prev => [...prev, newService]);
  }, [services]);

  const updateService = useCallback((id: number, updates: Partial<Service>) => {
    // setServices(prev => prev.map(service => service.id === id ? { ...service, ...updates } : service));
  }, []);

  const removeService = useCallback((id: number) => {
    // setServices(prev => prev.map(service => service.id === id ? { ...service, isActive: false } : service));
  }, []);

  const calculateTotalPrice = useCallback((serviceIds: number[]) => {
    return services
      .filter(service => serviceIds.includes(service.id))
      .reduce((total, service) => total + service.price, 0);
  }, [services]);

  // Funções dos Agendamentos
  const addAppointment = useCallback((appointment: Omit<Appointment, 'id'>) => {
    const newId = Math.max(0, ...appointments.map(a => a.id)) + 1;
    const newAppointment = { ...appointment, id: newId };
    setAppointments(prev => [...prev, newAppointment]);
  }, [appointments]);

  const updateAppointment = useCallback((id: number, updates: Partial<Appointment>) => {
    setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, ...updates } : apt));
  }, []);

  const cancelAppointment = useCallback((id: number) => {
    updateAppointment(id, { status: 'cancelado' });
  }, [updateAppointment]);

  const getAppointmentsByDate = useCallback((date: Date) => {
    return appointments.filter(apt => 
      apt.date.toDateString() === date.toDateString()
    );
  }, [appointments]);

  const getAppointmentsByEmployee = useCallback((employeeId: number) => {
    return appointments.filter(apt => apt.employeeId === employeeId);
  }, [appointments]);

  const getAppointmentsByClient = useCallback((clientId: number) => {
    return appointments.filter(apt => apt.clientId === clientId);
  }, [appointments]);

  const contextValue: StoreContextType = {
    storeName,
    
    // Funcionários
    employees,
    selectedEmployee,
    activeEmployee,
    setSelectedEmployee,
    addEmployee,
    updateEmployee,
    removeEmployee,
    getActiveEmployees,
    
    // Clientes
    clients,
    selectedClient,
    setSelectedClient,
    addClient,
    updateClient,
    removeClient,
    searchClients,
    
    // Serviços
    services,
    selectedServices,
    setSelectedServices,
    addService,
    updateService,
    removeService,
    getActiveServices,
    calculateTotalPrice,
    
    // Agendamentos
    appointments,
    addAppointment,
    updateAppointment,
    cancelAppointment,
    getAppointmentsByDate,
    getAppointmentsByEmployee,
    getAppointmentsByClient
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

// Hook personalizado para usar o contexto
const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore deve ser usado dentro de um StoreProvider');
  }
  return context;
};

export { StoreContext, StoreProvider, useStore };
export type { Employee, Client, Service, Appointment, StoreContextType };
