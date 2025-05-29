// src/contexts/ConfigContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { BarbeariaService } from '@/services/barbeariaService';
import { AuthService } from '@/services/authService';
import { useAuth } from './UserContext';
import { validateContribuinte } from '@/utils/validators';
import type { Barbearia, ConfigContextType } from '@/types';

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

interface ConfigProviderProps {
  children: ReactNode;
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
  const appName = 'Barber Connect';
  const { user } = useAuth();
  
  const [contribuinte, setContribuinteState] = useState<string | null>(null);
  const [barbearia, setBarbearia] = useState<Barbearia | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar configurações do localStorage na inicialização
  useEffect(() => {
    const savedContribuinte = localStorage.getItem('barber_contribuinte');
    if (savedContribuinte && user) {
      loadBarbearia(savedContribuinte);
    }
  }, [user]);

  // Carregar dados da barbearia
  const loadBarbearia = useCallback(async (contribuinteValue: string) => {
    if (!user) return;

    setLoading(true);
    setError(null);
    
    try {
      // Verificar se usuário tem acesso ao contribuinte
      const hasAccess = await AuthService.checkUserAccess(user.uid, contribuinteValue);
      if (!hasAccess) {
        throw new Error('Usuário não tem acesso a esta barbearia');
      }

      const barbeariaData = await BarbeariaService.buscarBarbearia(contribuinteValue);
      if (barbeariaData) {
        setContribuinteState(contribuinteValue);
        setBarbearia(barbeariaData);
        localStorage.setItem('barber_contribuinte', contribuinteValue);
      } else {
        throw new Error('Barbearia não encontrada');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar barbearia';
      setError(errorMessage);
      console.error('Erro ao carregar barbearia:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Definir contribuinte e carregar barbearia
  const setContribuinte = useCallback(async (newContribuinte: string): Promise<void> => {
    if (!validateContribuinte(newContribuinte)) {
      throw new Error('Contribuinte deve conter apenas números e ter no máximo 9 dígitos');
    }

    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    await loadBarbearia(newContribuinte);
  }, [user, loadBarbearia]);

  // Criar nova barbearia
  const createBarbearia = useCallback(async (barbeariaData: Omit<Barbearia, keyof import('@/types').BaseEntity>): Promise<void> => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    if (!validateContribuinte(barbeariaData.contribuinte)) {
      throw new Error('Contribuinte deve conter apenas números e ter no máximo 9 dígitos');
    }

    setLoading(true);
    setError(null);

    try {
      await BarbeariaService.criarBarbearia(barbeariaData, user.uid);
      
      // Adicionar contribuinte ao usuário
      await AuthService.addContribuinteToUser(user.uid, barbeariaData.contribuinte);
      
      // Carregar a barbearia criada
      await loadBarbearia(barbeariaData.contribuinte);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar barbearia';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, loadBarbearia]);

  // Atualizar barbearia
  const updateBarbearia = useCallback(async (updates: Partial<Barbearia>): Promise<void> => {
    if (!contribuinte || !user) {
      throw new Error('Contribuinte ou usuário não definido');
    }

    setLoading(true);
    setError(null);

    try {
      await BarbeariaService.atualizarBarbearia(contribuinte, updates);
      
      // Atualizar estado local
      if (barbearia) {
        const updatedBarbearia = { ...barbearia, ...updates };
        setBarbearia(updatedBarbearia);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar barbearia';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contribuinte, user, barbearia]);

  // Limpar configurações
  const clearConfiguration = useCallback(() => {
    setContribuinteState(null);
    setBarbearia(null);
    setError(null);
    localStorage.removeItem('barber_contribuinte');
  }, []);

  // Verificar se está configurado
  const isConfigured = !!(
    contribuinte && 
    barbearia && 
    barbearia.nomeEstabelecimento && 
    barbearia.endereco
  );

  const value: ConfigContextType = {
    appName,
    contribuinte,
    barbearia,
    isConfigured,
    loading,
    error,
    setContribuinte,
    createBarbearia,
    updateBarbearia,
    clearConfiguration,
    validateContribuinte
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useConfig = (): ConfigContextType => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig deve ser usado dentro de um ConfigProvider');
  }
  return context;
};

export { ConfigContext };
