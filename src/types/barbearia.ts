// src/types/barbearia.ts
import { 
  BaseEntity, 
  StatusAgendamento, 
  HorarioTrabalho, 
  ConfiguracoesSistema, 
  HorarioFuncionamento 
} from './index';

// Interface principal da barbearia
export interface Barbearia extends BaseEntity {
  contribuinte: string;
  nomeEstabelecimento: string;
  endereco: string;
  telefone: string;
  email?: string;
  horarioFuncionamento: HorarioFuncionamento;
  configuracoesSistema: ConfiguracoesSistema;
  criadoPor: string; // UID do usuário que criou
}



// Interface para funcionário
export interface Funcionario extends BaseEntity {
  nome: string;
  email?: string;
  telefone?: string;
  especialidades: string[];
  horarioTrabalho: HorarioTrabalho;
  avatar?: string;
  salario?: number;
  comissao?: number;
}

// ✅ ADICIONE ESTA INTERFACE QUE ESTAVA FALTANDO
export interface ConfigContextType {
  appName: string;
  contribuinte: string | null;
  barbearia: Barbearia | null;
  isConfigured: boolean;
  loading: boolean;
  error: string | null;
  
  // Funções de configuração
  setContribuinte: (contribuinte: string) => Promise<void>;
  createBarbearia: (barbearia: Omit<Barbearia, keyof BaseEntity>) => Promise<void>;
  updateBarbearia: (updates: Partial<Barbearia>) => Promise<void>;
  clearConfiguration: () => void;
  validateContribuinte: (contribuinte: string) => boolean;
}

// Interface para cliente
export interface Cliente extends BaseEntity {
  nome: string;
  email: string;
  telefone: string;
  dataNascimento?: Date;
  endereco?: string;
  ultimaVisita?: Date;
  totalVisitas: number;
  preferencias?: string[];
  observacoes?: string;
}

// Interface para serviço
export interface Servico extends BaseEntity {
  nome: string;
  descricao: string;
  duracao: number; // em minutos
  preco: number;
  categoria: string;
  comissao?: number; // percentual de comissão
}

// Interface para agendamento
export interface Agendamento extends BaseEntity {
  clienteId: string;
  funcionarioId: string;
  servicoIds: string[];
  data: Date;
  horarioInicio: string;
  horarioFim: string;
  status: StatusAgendamento;
  observacoes?: string;
  precoTotal: number;
  desconto?: number;
  formaPagamento?: string;
  pago: boolean;
}

// Interface para relatório financeiro
export interface RelatorioFinanceiro {
  periodo: {
    inicio: Date;
    fim: Date;
  };
  faturamentoTotal: number;
  agendamentosRealizados: number;
  agendamentosCancelados: number;
  clientesAtendidos: number;
  servicosMaisVendidos: Array<{
    servicoId: string;
    nome: string;
    quantidade: number;
    faturamento: number;
  }>;
  funcionariosMaisAtivos: Array<{
    funcionarioId: string;
    nome: string;
    agendamentos: number;
    faturamento: number;
  }>;
}



// Interface para contexto da loja/barbearia
export interface StoreContextType {
  // Estados
  funcionarios: Funcionario[];
  clientes: Cliente[];
  servicos: Servico[];
  agendamentos: Agendamento[];
  selectedFuncionario: Funcionario | null;
  loading: boolean;
  error: string | null;

  // Funções para funcionários
  setSelectedFuncionario: (funcionario: Funcionario | null) => void;
  addFuncionario: (funcionario: Omit<Funcionario, keyof BaseEntity>) => Promise<string>;
  updateFuncionario: (id: string, updates: Partial<Funcionario>) => Promise<void>;
  removeFuncionario: (id: string) => Promise<void>;
  getFuncionariosAtivos: () => Funcionario[];

  // Funções para clientes
  addCliente: (cliente: Omit<Cliente, keyof BaseEntity | 'totalVisitas'>) => Promise<string>;
  updateCliente: (id: string, updates: Partial<Cliente>) => Promise<void>;
  removeCliente: (id: string) => Promise<void>;
  searchClientes: (query: string) => Cliente[];

  // Funções para serviços
  addServico: (servico: Omit<Servico, keyof BaseEntity>) => Promise<string>;
  updateServico: (id: string, updates: Partial<Servico>) => Promise<void>;
  removeServico: (id: string) => Promise<void>;
  getServicosAtivos: () => Servico[];
  calculateTotalPrice: (servicoIds: string[]) => number;

  // Funções para agendamentos
  createAgendamento: (agendamento: Omit<Agendamento, keyof BaseEntity>) => Promise<string>;
  updateAgendamento: (id: string, updates: Partial<Agendamento>) => Promise<void>;
  cancelAgendamento: (id: string) => Promise<void>;
  getAgendamentosByDate: (date: Date) => Agendamento[];
  getAgendamentosByFuncionario: (funcionarioId: string) => Agendamento[];
  getAgendamentosByCliente: (clienteId: string) => Agendamento[];

  // Funções utilitárias
  refreshData: () => Promise<void>;
  clearError: () => void;
}
