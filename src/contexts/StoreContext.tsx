// src/contexts/StoreContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { BarbeariaService } from '@/services/barbeariaService';
import { useAuth } from './UserContext';
import { useConfig } from './ConfigContext';
import type { 
  Funcionario, 
  Cliente, 
  Servico, 
  Agendamento, 
  StoreContextType 
} from '@/types';

const StoreContext = createContext<StoreContextType | undefined>(undefined);

interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { contribuinte, isConfigured } = useConfig();

  // Estados
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [selectedFuncionario, setSelectedFuncionario] = useState<Funcionario | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados quando contribuinte estiver disponível
  useEffect(() => {
    if (contribuinte && user && isConfigured) {
      refreshData();
    }
  }, [contribuinte, user, isConfigured]);

  // Definir funcionário padrão quando funcionários carregarem
  useEffect(() => {
    if (funcionarios.length > 0 && !selectedFuncionario) {
      const funcionarioPadrao = funcionarios.find(f => f.nome.includes('Todos'));
      setSelectedFuncionario(funcionarioPadrao || funcionarios[0]); // ✅ CORRIGIDO: era funcionarios sem [0]
    }
  }, [funcionarios, selectedFuncionario]);

  // Atualizar todos os dados
  const refreshData = useCallback(async (): Promise<void> => {
    if (!contribuinte || !user) return;

    setLoading(true);
    setError(null);

    try {
      const [funcionariosData, clientesData, servicosData, agendamentosData] = await Promise.all([
        BarbeariaService.buscarFuncionarios(contribuinte),
        BarbeariaService.buscarClientes(contribuinte),
        BarbeariaService.buscarServicos(contribuinte),
        BarbeariaService.buscarAgendamentos(contribuinte)
      ]);

      setFuncionarios(funcionariosData);
      setClientes(clientesData);
      setServicos(servicosData);
      setAgendamentos(agendamentosData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados';
      setError(errorMessage);
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }, [contribuinte, user]);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ===== FUNCIONÁRIOS =====
  
  const addFuncionario = useCallback(async (funcionario: Omit<Funcionario, keyof import('@/types').BaseEntity>): Promise<string> => {
    if (!contribuinte) throw new Error('Contribuinte não definido');

    try {
      const id = await BarbeariaService.adicionarFuncionario(contribuinte, funcionario);
      await refreshData();
      return id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar funcionário';
      setError(errorMessage);
      throw err;
    }
  }, [contribuinte, refreshData]);

  const updateFuncionario = useCallback(async (id: string, updates: Partial<Funcionario>): Promise<void> => {
  if (!contribuinte) throw new Error('Contribuinte não definido');

  try {
    await BarbeariaService.atualizarFuncionario(contribuinte, id, updates);
    await refreshData();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar funcionário';
    setError(errorMessage);
    throw err;
  }
}, [contribuinte, refreshData]);

const removeFuncionario = useCallback(async (id: string): Promise<void> => {
  if (!contribuinte) throw new Error('Contribuinte não definido');

  try {
    await BarbeariaService.removerFuncionario(contribuinte, id);
    await refreshData();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Erro ao remover funcionário';
    setError(errorMessage);
    throw err;
  }
}, [contribuinte, refreshData]);

  const getFuncionariosAtivos = useCallback((): Funcionario[] => {
    return funcionarios.filter(f => f.ativo);
  }, [funcionarios]);

  // ===== CLIENTES =====
  
  const addCliente = useCallback(async (cliente: Omit<Cliente, keyof import('@/types').BaseEntity | 'totalVisitas'>): Promise<string> => {
    if (!contribuinte) throw new Error('Contribuinte não definido');

    try {
      const id = await BarbeariaService.adicionarCliente(contribuinte, cliente);
      await refreshData();
      return id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar cliente';
      setError(errorMessage);
      throw err;
    }
  }, [contribuinte, refreshData]);

  const updateCliente = useCallback(async (id: string, updates: Partial<Cliente>): Promise<void> => {
    if (!contribuinte) throw new Error('Contribuinte não definido');

    try {
      // Implementar atualização no service
      await refreshData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar cliente';
      setError(errorMessage);
      throw err;
    }
  }, [contribuinte, refreshData]);

  const removeCliente = useCallback(async (id: string): Promise<void> => {
    if (!contribuinte) throw new Error('Contribuinte não definido');

    try {
      // Implementar remoção no service
      await refreshData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover cliente';
      setError(errorMessage);
      throw err;
    }
  }, [contribuinte, refreshData]);

  const searchClientes = useCallback((query: string): Cliente[] => {
    const searchTerm = query.toLowerCase();
    return clientes.filter(cliente =>
      cliente.nome.toLowerCase().includes(searchTerm) ||
      cliente.email.toLowerCase().includes(searchTerm) ||
      cliente.telefone.includes(searchTerm)
    );
  }, [clientes]);

  // ===== SERVIÇOS =====
  
  const addServico = useCallback(async (servico: Omit<Servico, keyof import('@/types').BaseEntity>): Promise<string> => {
    if (!contribuinte) throw new Error('Contribuinte não definido');

    try {
      // Implementar adição no service
      await refreshData();
      return 'temp-id';
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar serviço';
      setError(errorMessage);
      throw err;
    }
  }, [contribuinte, refreshData]);

  const updateServico = useCallback(async (id: string, updates: Partial<Servico>): Promise<void> => {
    if (!contribuinte) throw new Error('Contribuinte não definido');

    try {
      // Implementar atualização no service
      await refreshData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar serviço';
      setError(errorMessage);
      throw err;
    }
  }, [contribuinte, refreshData]);

  const removeServico = useCallback(async (id: string): Promise<void> => {
    if (!contribuinte) throw new Error('Contribuinte não definido');

    try {
      // Implementar remoção no service
      await refreshData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover serviço';
      setError(errorMessage);
      throw err;
    }
  }, [contribuinte, refreshData]);

  const getServicosAtivos = useCallback((): Servico[] => {
    return servicos.filter(s => s.ativo);
  }, [servicos]);

  const calculateTotalPrice = useCallback((servicoIds: string[]): number => {
    return servicos
      .filter(servico => servicoIds.includes(servico.id))
      .reduce((total, servico) => total + servico.preco, 0);
  }, [servicos]);

  // ===== AGENDAMENTOS =====
  
  const createAgendamento = useCallback(async (agendamento: Omit<Agendamento, keyof import('@/types').BaseEntity>): Promise<string> => {
    if (!contribuinte) throw new Error('Contribuinte não definido');

    try {
      const id = await BarbeariaService.criarAgendamento(contribuinte, agendamento);
      await refreshData();
      return id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar agendamento';
      setError(errorMessage);
      throw err;
    }
  }, [contribuinte, refreshData]);

  const updateAgendamento = useCallback(async (id: string, updates: Partial<Agendamento>): Promise<void> => {
    if (!contribuinte) throw new Error('Contribuinte não definido');

    try {
      // Implementar atualização no service
      await refreshData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar agendamento';
      setError(errorMessage);
      throw err;
    }
  }, [contribuinte, refreshData]);

  const cancelAgendamento = useCallback(async (id: string): Promise<void> => {
    if (!contribuinte) throw new Error('Contribuinte não definido');

    try {
      // Implementar cancelamento no service
      await refreshData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao cancelar agendamento';
      setError(errorMessage);
      throw err;
    }
  }, [contribuinte, refreshData]);

  const getAgendamentosByDate = useCallback((date: Date): Agendamento[] => {
    return agendamentos.filter(agendamento => {
      const agendamentoDate = new Date(agendamento.data);
      return agendamentoDate.toDateString() === date.toDateString();
    });
  }, [agendamentos]);

  // ✅ COMPLETANDO AS FUNÇÕES QUE ESTAVAM FALTANDO
  const getAgendamentosByFuncionario = useCallback((funcionarioId: string): Agendamento[] => {
    return agendamentos.filter(agendamento => agendamento.funcionarioId === funcionarioId);
  }, [agendamentos]);

  const getAgendamentosByCliente = useCallback((clienteId: string): Agendamento[] => {
    return agendamentos.filter(agendamento => agendamento.clienteId === clienteId);
  }, [agendamentos]);

  // ✅ CRIANDO O VALOR DO CONTEXTO
  const value: StoreContextType = {
    // Estados
    funcionarios,
    clientes,
    servicos,
    agendamentos,
    selectedFuncionario,
    loading,
    error,

    // Funções para funcionários
    setSelectedFuncionario,
    addFuncionario,
    updateFuncionario,
    removeFuncionario,
    getFuncionariosAtivos,

    // Funções para clientes
    addCliente,
    updateCliente,
    removeCliente,
    searchClientes,

    // Funções para serviços
    addServico,
    updateServico,
    removeServico,
    getServicosAtivos,
    calculateTotalPrice,

    // Funções para agendamentos
    createAgendamento,
    updateAgendamento,
    cancelAgendamento,
    getAgendamentosByDate,
    getAgendamentosByFuncionario,
    getAgendamentosByCliente,

    // Funções utilitárias
    refreshData,
    clearError
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore deve ser usado dentro de um StoreProvider');
  }
  return context;
};

export { StoreContext };
