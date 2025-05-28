import React, { useState, useEffect } from 'react';
import { useConfig } from '../../contexts/ConfigContext';
import styles from './ConfigurationPage.module.scss';

interface FormData {
  contribuinte: string;
  nomeEstabelecimento: string;
  endereco: string;
  telefone: string;
  horarioAbertura: string;
  horarioFechamento: string;
  diasFuncionamento: string[];
  intervaloAgendamento: number;
  antecedenciaMinima: number;
  antecedenciaMaxima: number;
  permiteCancelamento: boolean;
  tempoLimiteCancelamento: number;
}

interface FormErrors {
  contribuinte?: string;
  nomeEstabelecimento?: string;
  endereco?: string;
  telefone?: string;
  horarioAbertura?: string;
  horarioFechamento?: string;
  diasFuncionamento?: string;
  intervaloAgendamento?: string;
  antecedenciaMinima?: string;
  antecedenciaMaxima?: string;
  permiteCancelamento?: string;
  tempoLimiteCancelamento?: string;
  submit?: string;
  newClient?: string;
  general?: string;
}

const ConfigurationPage: React.FC = () => {
  const { 
    contribuinte, 
    barberShopConfig, 
    setContribuinte, 
    updateBarberShopConfig, 
    createBarberShop,
    validateContribuinte,
    isConfigured 
  } = useConfig();

  const [formData, setFormData] = useState<FormData>({
    contribuinte: contribuinte || '',
    nomeEstabelecimento: barberShopConfig?.nomeEstabelecimento || '',
    endereco: barberShopConfig?.endereco || '',
    telefone: barberShopConfig?.telefone || '',
    horarioAbertura: barberShopConfig?.horarioFuncionamento?.abertura || '08:00',
    horarioFechamento: barberShopConfig?.horarioFuncionamento?.fechamento || '18:00',
    diasFuncionamento: barberShopConfig?.horarioFuncionamento?.diasFuncionamento || [],
    intervaloAgendamento: barberShopConfig?.configuracoesSistema?.intervaloAgendamento || 30,
    antecedenciaMinima: barberShopConfig?.configuracoesSistema?.antecedenciaMinima || 1,
    antecedenciaMaxima: barberShopConfig?.configuracoesSistema?.antecedenciaMaxima || 30,
    permiteCancelamento: barberShopConfig?.configuracoesSistema?.permiteCancelamento || true,
    tempoLimiteCancelamento: barberShopConfig?.configuracoesSistema?.tempoLimiteCancelamento || 2
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const diasSemana = [
    'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'
  ];

  useEffect(() => {
    if (barberShopConfig) {
      setFormData(prev => ({
        ...prev,
        nomeEstabelecimento: barberShopConfig.nomeEstabelecimento || '',
        endereco: barberShopConfig.endereco || '',
        telefone: barberShopConfig.telefone || '',
        horarioAbertura: barberShopConfig.horarioFuncionamento?.abertura || '08:00',
        horarioFechamento: barberShopConfig.horarioFuncionamento?.fechamento || '18:00',
        diasFuncionamento: barberShopConfig.horarioFuncionamento?.diasFuncionamento || [],
        intervaloAgendamento: barberShopConfig.configuracoesSistema?.intervaloAgendamento || 30,
        antecedenciaMinima: barberShopConfig.configuracoesSistema?.antecedenciaMinima || 1,
        antecedenciaMaxima: barberShopConfig.configuracoesSistema?.antecedenciaMaxima || 30,
        permiteCancelamento: barberShopConfig.configuracoesSistema?.permiteCancelamento || true,
        tempoLimiteCancelamento: barberShopConfig.configuracoesSistema?.tempoLimiteCancelamento || 2
      }));
    }
  }, [barberShopConfig]);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpa erro do campo quando usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleDiaFuncionamentoChange = (dia: string, checked: boolean) => {
    const novosDias = checked 
      ? [...formData.diasFuncionamento, dia]
      : formData.diasFuncionamento.filter(d => d !== dia);
    
    handleInputChange('diasFuncionamento', novosDias);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.contribuinte) {
      newErrors.contribuinte = 'Contribuinte é obrigatório';
    } else if (!validateContribuinte(formData.contribuinte)) {
      newErrors.contribuinte = 'Contribuinte deve conter apenas números (máximo 9 dígitos)';
    }

    if (!formData.nomeEstabelecimento.trim()) {
      newErrors.nomeEstabelecimento = 'Nome do estabelecimento é obrigatório';
    }

    if (!formData.endereco.trim()) {
      newErrors.endereco = 'Endereço é obrigatório';
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    }

    if (formData.diasFuncionamento.length === 0) {
      newErrors.diasFuncionamento = 'Selecione pelo menos um dia de funcionamento';
    }

    if (formData.horarioAbertura >= formData.horarioFechamento) {
      newErrors.horarioAbertura = 'Horário de abertura deve ser anterior ao fechamento';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({}); // Limpar erros antes de tentar salvar

    try {
      const configData = {
        contribuinte: formData.contribuinte,
        nomeEstabelecimento: formData.nomeEstabelecimento,
        endereco: formData.endereco,
        telefone: formData.telefone,
        horarioFuncionamento: {
          abertura: formData.horarioAbertura,
          fechamento: formData.horarioFechamento,
          diasFuncionamento: formData.diasFuncionamento
        },
        configuracoesSistema: {
          intervaloAgendamento: formData.intervaloAgendamento,
          antecedenciaMinima: formData.antecedenciaMinima,
          antecedenciaMaxima: formData.antecedenciaMaxima,
          permiteCancelamento: formData.permiteCancelamento,
          tempoLimiteCancelamento: formData.tempoLimiteCancelamento
        }
      };

      if (isConfigured) {
        // Atualizar configuração existente
        await updateBarberShopConfig(configData);
      } else {
        // Criar nova barbearia
        await createBarberShop(configData);
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error);
      setErrors({ submit: error.message || 'Erro ao salvar configurações' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.configurationPage}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Configuração da Barbearia</h1>
          <p>Configure os dados da sua barbearia para começar a usar o sistema</p>
          {isConfigured && (
            <div className={styles.statusBadge}>
              <span className={styles.configuredBadge}>✓ Configurado</span>
            </div>
          )}
        </header>

        {showSuccess && (
          <div className={styles.successMessage}>
            <span>✓ Configurações salvas com sucesso!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Dados Básicos */}
          <section className={styles.section}>
            <h2>Dados Básicos</h2>
            
            <div className={styles.inputGroup}>
              <label htmlFor="contribuinte">Contribuinte *</label>
              <input
                id="contribuinte"
                type="text"
                value={formData.contribuinte}
                onChange={(e) => handleInputChange('contribuinte', e.target.value)}
                placeholder="Digite o contribuinte (até 9 dígitos)"
                maxLength={9}
                className={errors.contribuinte ? styles.inputError : ''}
              />
              {errors.contribuinte && (
                <span className={styles.errorMessage}>{errors.contribuinte}</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="nomeEstabelecimento">Nome do Estabelecimento *</label>
              <input
                id="nomeEstabelecimento"
                type="text"
                value={formData.nomeEstabelecimento}
                onChange={(e) => handleInputChange('nomeEstabelecimento', e.target.value)}
                placeholder="Ex: Barbearia do João"
                className={errors.nomeEstabelecimento ? styles.inputError : ''}
              />
              {errors.nomeEstabelecimento && (
                <span className={styles.errorMessage}>{errors.nomeEstabelecimento}</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="endereco">Endereço *</label>
              <input
                id="endereco"
                type="text"
                value={formData.endereco}
                onChange={(e) => handleInputChange('endereco', e.target.value)}
                placeholder="Rua, número, bairro, cidade"
                className={errors.endereco ? styles.inputError : ''}
              />
              {errors.endereco && (
                <span className={styles.errorMessage}>{errors.endereco}</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="telefone">Telefone *</label>
              <input
                id="telefone"
                type="tel"
                value={formData.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                placeholder="(11) 99999-9999"
                className={errors.telefone ? styles.inputError : ''}
              />
              {errors.telefone && (
                <span className={styles.errorMessage}>{errors.telefone}</span>
              )}
            </div>
          </section>

          {/* Horário de Funcionamento */}
          <section className={styles.section}>
            <h2>Horário de Funcionamento</h2>
            
            <div className={styles.timeInputs}>
              <div className={styles.inputGroup}>
                <label htmlFor="horarioAbertura">Abertura</label>
                <input
                  id="horarioAbertura"
                  type="time"
                  value={formData.horarioAbertura}
                  onChange={(e) => handleInputChange('horarioAbertura', e.target.value)}
                  className={errors.horarioAbertura ? styles.inputError : ''}
                />
                {errors.horarioAbertura && (
                  <span className={styles.errorMessage}>{errors.horarioAbertura}</span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="horarioFechamento">Fechamento</label>
                <input
                  id="horarioFechamento"
                  type="time"
                  value={formData.horarioFechamento}
                  onChange={(e) => handleInputChange('horarioFechamento', e.target.value)}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Dias de Funcionamento *</label>
              <div className={styles.checkboxGroup}>
                {diasSemana.map(dia => (
                  <label key={dia} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={formData.diasFuncionamento.includes(dia)}
                      onChange={(e) => handleDiaFuncionamentoChange(dia, e.target.checked)}
                    />
                    <span>{dia.charAt(0).toUpperCase() + dia.slice(1)}</span>
                  </label>
                ))}
              </div>
              {errors.diasFuncionamento && (
                <span className={styles.errorMessage}>{errors.diasFuncionamento}</span>
              )}
            </div>
          </section>

          {/* Configurações do Sistema */}
          <section className={styles.section}>
            <h2>Configurações do Sistema</h2>
            
            <div className={styles.inputGroup}>
              <label htmlFor="intervaloAgendamento">Intervalo entre Agendamentos (minutos)</label>
              <select
                id="intervaloAgendamento"
                value={formData.intervaloAgendamento}
                onChange={(e) => handleInputChange('intervaloAgendamento', Number(e.target.value))}
              >
                <option value={15}>15 minutos</option>
                <option value={30}>30 minutos</option>
                <option value={45}>45 minutos</option>
                <option value={60}>60 minutos</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="antecedenciaMinima">Antecedência Mínima (horas)</label>
              <input
                id="antecedenciaMinima"
                type="number"
                min="1"
                max="48"
                value={formData.antecedenciaMinima}
                onChange={(e) => handleInputChange('antecedenciaMinima', Number(e.target.value))}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="antecedenciaMaxima">Antecedência Máxima (dias)</label>
              <input
                id="antecedenciaMaxima"
                type="number"
                min="1"
                max="90"
                value={formData.antecedenciaMaxima}
                onChange={(e) => handleInputChange('antecedenciaMaxima', Number(e.target.value))}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.permiteCancelamento}
                  onChange={(e) => handleInputChange('permiteCancelamento', e.target.checked)}
                />
                <span>Permitir cancelamento de agendamentos</span>
              </label>
            </div>

            {formData.permiteCancelamento && (
              <div className={styles.inputGroup}>
                <label htmlFor="tempoLimiteCancelamento">Tempo Limite para Cancelamento (horas)</label>
                <input
                  id="tempoLimiteCancelamento"
                  type="number"
                  min="1"
                  max="48"
                  value={formData.tempoLimiteCancelamento}
                  onChange={(e) => handleInputChange('tempoLimiteCancelamento', Number(e.target.value))}
                />
              </div>
            )}
          </section>

          {/* Mostrar erro de submissão */}
          {errors.submit && (
            <div className={styles.submitError}>
              {errors.submit}
            </div>
          )}

          <div className={styles.buttonGroup}>
            <button 
              type="submit" 
              className={styles.saveButton}
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : 'Salvar Configurações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfigurationPage;
