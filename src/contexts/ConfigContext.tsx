// src/contexts/ConfigContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { barbeariaService, BarbeariaConfig } from "../../services/barbeariaService";

interface ConfigContextType {
  appName: string;
  contribuinte: string | null;
  barberShopConfig: BarbeariaConfig | null;
  isConfigured: boolean;
  loading: boolean;
  error: string | null;
  
  setContribuinte: (contribuinte: string) => Promise<void>;
  updateBarberShopConfig: (config: Partial<BarbeariaConfig>) => Promise<void>;
  createBarberShop: (config: Omit<BarbeariaConfig, 'criadoEm' | 'atualizadoEm' | 'ativo'>) => Promise<void>;
  clearConfiguration: () => void;
  validateContribuinte: (contribuinte: string) => boolean;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

interface ConfigProviderProps {
  children: ReactNode;
}

const ConfigProvider = ({ children }: ConfigProviderProps) => {
  const appName = 'Barber Connect';
  const [contribuinte, setContribuinteState] = useState<string | null>(null);
  const [barberShopConfig, setBarberShopConfig] = useState<BarbeariaConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carrega configurações do localStorage na inicialização
  useEffect(() => {
    const savedContribuinte = localStorage.getItem('barber_contribuinte');
    if (savedContribuinte) {
      loadBarberShopConfig(savedContribuinte);
    }
  }, []);

  // Carrega configuração da barbearia do Firebase
  const loadBarberShopConfig = async (contribuinteValue: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const config = await barbeariaService.buscarConfiguracao(contribuinteValue);
      if (config) {
        setContribuinteState(contribuinteValue);
        setBarberShopConfig(config);
        localStorage.setItem('barber_contribuinte', contribuinteValue);
      } else {
        setError('Barbearia não encontrada');
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      setError('Erro ao carregar configuração da barbearia');
    } finally {
      setLoading(false);
    }
  };

  // Valida se o contribuinte tem formato correto (até 9 dígitos numéricos)
  const validateContribuinte = (contribuinteValue: string): boolean => {
    const regex = /^\d{1,9}$/;
    return regex.test(contribuinteValue);
  };

  // Define o contribuinte e carrega configuração
  const setContribuinte = async (newContribuinte: string) => {
    if (!validateContribuinte(newContribuinte)) {
      throw new Error('Contribuinte deve conter apenas números e ter no máximo 9 dígitos');
    }

    await loadBarberShopConfig(newContribuinte);
  };

  // Cria nova barbearia
  const createBarberShop = async (config: Omit<BarbeariaConfig, 'criadoEm' | 'atualizadoEm' | 'ativo'>) => {
    setLoading(true);
    setError(null);

    try {
      if (!validateContribuinte(config.contribuinte)) {
        throw new Error('Contribuinte deve conter apenas números e ter no máximo 9 dígitos');
      }

      await barbeariaService.criarBarbearia(config);
      await loadBarberShopConfig(config.contribuinte);
    } catch (error: any) {
      console.error('Erro ao criar barbearia:', error);
      setError(error.message || 'Erro ao criar barbearia');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Atualiza configurações da barbearia
  const updateBarberShopConfig = async (configUpdate: Partial<BarbeariaConfig>) => {
    if (!contribuinte) {
      throw new Error('Contribuinte não definido');
    }

    setLoading(true);
    setError(null);

    try {
      await barbeariaService.atualizarConfiguracao(contribuinte, configUpdate);
      
      // Atualiza estado local
      if (barberShopConfig) {
        const updatedConfig = { ...barberShopConfig, ...configUpdate };
        setBarberShopConfig(updatedConfig);
      }
    } catch (error: any) {
      console.error('Erro ao atualizar configuração:', error);
      setError(error.message || 'Erro ao atualizar configuração');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Limpa todas as configurações
  const clearConfiguration = () => {
    setContribuinteState(null);
    setBarberShopConfig(null);
    setError(null);
    localStorage.removeItem('barber_contribuinte');
  };

  // Verifica se a barbearia está configurada
  const isConfigured = !!(
    contribuinte && 
    barberShopConfig && 
    barberShopConfig.nomeEstabelecimento && 
    barberShopConfig.endereco
  );

  const contextValue: ConfigContextType = {
    appName,
    contribuinte,
    barberShopConfig,
    isConfigured,
    loading,
    error,
    setContribuinte,
    updateBarberShopConfig,
    createBarberShop,
    clearConfiguration,
    validateContribuinte
  };

  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  );
};

// Hook personalizado para usar o contexto
const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig deve ser usado dentro de um ConfigProvider');
  }
  return context;
};

export { ConfigContext, ConfigProvider, useConfig };
export type { BarbeariaConfig, ConfigContextType };
