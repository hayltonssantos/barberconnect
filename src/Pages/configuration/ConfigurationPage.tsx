// src/pages/Configuration/ConfigurationPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Row, Col, Button, Alert } from 'react-bootstrap';
import { useAuth } from '@/contexts/UserContext';
import { useConfig } from '@/contexts/ConfigContext';
import type { Barbearia, FormErrors, DiaSemana } from '@/types';
import styles from './ConfigurationPage.module.scss';

interface ConfigForm {
  contribuinte: string;
  nomeEstabelecimento: string;
  endereco: string;
  telefone: string;
  email: string;
  horarioAbertura: string;
  horarioFechamento: string;
  diasFuncionamento: DiaSemana[];
  intervaloAgendamento: number;
  antecedenciaMinima: number;
  antecedenciaMaxima: number;
  permiteCancelamento: boolean;
  tempoLimiteCancelamento: number;
}

const ConfigurationPage: React.FC = () => {
  const { user } = useAuth();
  const { 
    contribuinte, 
    barbearia, 
    createBarbearia, 
    updateBarbearia, 
    isConfigured,
    loading,
    error: configError,
    validateContribuinte 
  } = useConfig();
  
  const navigate = useNavigate();
  const location = useLocation();

  const contribuinteFromState = location.state?.contribuinte;

  const [form, setForm] = useState<ConfigForm>({
    contribuinte: contribuinte || contribuinteFromState || '',
    nomeEstabelecimento: barbearia?.nomeEstabelecimento || '',
    endereco: barbearia?.endereco || '',
    telefone: barbearia?.telefone || '',
    email: barbearia?.email || '',
    horarioAbertura: barbearia?.horarioFuncionamento?.abertura || '08:00',
    horarioFechamento: barbearia?.horarioFuncionamento?.fechamento || '18:00',
    diasFuncionamento: barbearia?.horarioFuncionamento?.diasFuncionamento || [],
    intervaloAgendamento: barbearia?.configuracoesSistema?.intervaloAgendamento || 30,
    antecedenciaMinima: barbearia?.configuracoesSistema?.antecedenciaMinima || 1,
    antecedenciaMaxima: barbearia?.configuracoesSistema?.antecedenciaMaxima || 30,
    permiteCancelamento: barbearia?.configuracoesSistema?.permiteCancelamento ?? true,
    tempoLimiteCancelamento: barbearia?.configuracoesSistema?.tempoLimiteCancelamento || 2
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const diasSemana: DiaSemana[] = [
    'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'
  ];

  // Verificar se usuário está logado
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  // Atualizar form quando barbearia carregar
  useEffect(() => {
    if (barbearia) {
      setForm(prev => ({
        ...prev,
        nomeEstabelecimento: barbearia.nomeEstabelecimento || '',
        endereco: barbearia.endereco || '',
        telefone: barbearia.telefone || '',
        email: barbearia.email || '',
        horarioAbertura: barbearia.horarioFuncionamento?.abertura || '08:00',
        horarioFechamento: barbearia.horarioFuncionamento?.fechamento || '18:00',
        diasFuncionamento: barbearia.horarioFuncionamento?.diasFuncionamento || [],
        intervaloAgendamento: barbearia.configuracoesSistema?.intervaloAgendamento || 30,
        antecedenciaMinima: barbearia.configuracoesSistema?.antecedenciaMinima || 1,
        antecedenciaMaxima: barbearia.configuracoesSistema?.antecedenciaMaxima || 30,
        permiteCancelamento: barbearia.configuracoesSistema?.permiteCancelamento ?? true,
        tempoLimiteCancelamento: barbearia.configuracoesSistema?.tempoLimiteCancelamento || 2
      }));
    }
  }, [barbearia]);

  const handleInputChange = (field: keyof ConfigForm, value: any) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleDiaFuncionamentoChange = (dia: DiaSemana, checked: boolean) => {
    const novosDias = checked 
      ? [...form.diasFuncionamento, dia]
      : form.diasFuncionamento.filter(d => d !== dia);
    
    handleInputChange('diasFuncionamento', novosDias);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.contribuinte) {
      newErrors.contribuinte = 'Contribuinte é obrigatório';
    } else if (!validateContribuinte(form.contribuinte)) {
      newErrors.contribuinte = 'Contribuinte deve conter apenas números (máximo 9 dígitos)';
    }

    if (!form.nomeEstabelecimento.trim()) {
      newErrors.nomeEstabelecimento = 'Nome do estabelecimento é obrigatório';
    }

    if (!form.endereco.trim()) {
      newErrors.endereco = 'Endereço é obrigatório';
    }

    if (!form.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    }

    if (form.diasFuncionamento.length === 0) {
      newErrors.diasFuncionamento = 'Selecione pelo menos um dia de funcionamento';
    }

    if (form.horarioAbertura >= form.horarioFechamento) {
      newErrors.horarioAbertura = 'Horário de abertura deve ser anterior ao fechamento';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const barbeariaData: Omit<Barbearia, keyof import('@/types').BaseEntity> = {
        contribuinte: form.contribuinte,
        nomeEstabelecimento: form.nomeEstabelecimento,
        endereco: form.endereco,
        telefone: form.telefone,
        email: form.email,
        horarioFuncionamento: {
          abertura: form.horarioAbertura,
          fechamento: form.horarioFechamento,
          diasFuncionamento: form.diasFuncionamento
        },
        configuracoesSistema: {
          intervaloAgendamento: form.intervaloAgendamento,
          antecedenciaMinima: form.antecedenciaMinima,
          antecedenciaMaxima: form.antecedenciaMaxima,
          permiteCancelamento: form.permiteCancelamento,
          tempoLimiteCancelamento: form.tempoLimiteCancelamento
        }
      };

      if (isConfigured && barbearia) {
        // Atualizar configuração existente
        await updateBarbearia(barbeariaData);
      } else {
        // Criar nova barbearia
        await createBarbearia(barbeariaData);
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/store');
      }, 2000);

    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error);
      setErrors({ submit: error.message || 'Erro ao salvar configurações' });
    } finally {
      setIsSubmitting(false);
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
          <Alert variant="success" className={styles.successAlert}>
            ✓ Configurações salvas com sucesso! Redirecionando...
          </Alert>
        )}

        {configError && (
          <Alert variant="danger" className={styles.errorAlert}>
            {configError}
          </Alert>
        )}

        <Form onSubmit={handleSubmit} className={styles.form}>
          {/* Dados Básicos */}
          <section className={styles.section}>
            <h2>Dados Básicos</h2>
            
            <Row>
              <Col md={6}>
                <Form.Group className={styles.inputGroup}>
                  <Form.Label>Contribuinte *</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.contribuinte}
                    onChange={(e) => handleInputChange('contribuinte', e.target.value.replace(/\D/g, ''))}
                    placeholder="Digite o contribuinte (até 9 dígitos)"
                    maxLength={9}
                    isInvalid={!!errors.contribuinte}
                    disabled={isConfigured}
                    className={styles.input}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.contribuinte}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className={styles.inputGroup}>
                  <Form.Label>Nome do Estabelecimento *</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.nomeEstabelecimento}
                    onChange={(e) => handleInputChange('nomeEstabelecimento', e.target.value)}
                    placeholder="Ex: Barbearia do João"
                    isInvalid={!!errors.nomeEstabelecimento}
                    className={styles.input}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.nomeEstabelecimento}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={8}>
                <Form.Group className={styles.inputGroup}>
                  <Form.Label>Endereço *</Form.Label>
                  <Form.Control
                    type="text"
                    value={form.endereco}
                    onChange={(e) => handleInputChange('endereco', e.target.value)}
                    placeholder="Rua, número, bairro, cidade"
                    isInvalid={!!errors.endereco}
                    className={styles.input}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.endereco}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className={styles.inputGroup}>
                  <Form.Label>Telefone *</Form.Label>
                  <Form.Control
                    type="tel"
                    value={form.telefone}
                    onChange={(e) => handleInputChange('telefone', e.target.value)}
                    placeholder="(11) 99999-9999"
                    isInvalid={!!errors.telefone}
                    className={styles.input}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.telefone}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className={styles.inputGroup}>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={form.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="contato@barbearia.com"
                className={styles.input}
              />
            </Form.Group>
          </section>

          {/* Horário de Funcionamento */}
          <section className={styles.section}>
            <h2>Horário de Funcionamento</h2>
            
            <Row>
              <Col md={6}>
                <Form.Group className={styles.inputGroup}>
                  <Form.Label>Abertura</Form.Label>
                  <Form.Control
                    type="time"
                    value={form.horarioAbertura}
                    onChange={(e) => handleInputChange('horarioAbertura', e.target.value)}
                    isInvalid={!!errors.horarioAbertura}
                    className={styles.input}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.horarioAbertura}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className={styles.inputGroup}>
                  <Form.Label>Fechamento</Form.Label>
                  <Form.Control
                    type="time"
                    value={form.horarioFechamento}
                    onChange={(e) => handleInputChange('horarioFechamento', e.target.value)}
                    className={styles.input}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className={styles.inputGroup}>
              <Form.Label>Dias de Funcionamento *</Form.Label>
              <div className={styles.checkboxGroup}>
                {diasSemana.map(dia => (
                  <Form.Check
                    key={dia}
                    type="checkbox"
                    id={`dia-${dia}`}
                    label={dia.charAt(0).toUpperCase() + dia.slice(1)}
                    checked={form.diasFuncionamento.includes(dia)}
                    onChange={(e) => handleDiaFuncionamentoChange(dia, e.target.checked)}
                    className={styles.checkbox}
                  />
                ))}
              </div>
              {errors.diasFuncionamento && (
                <div className={styles.errorMessage}>{errors.diasFuncionamento}</div>
              )}
            </Form.Group>
          </section>

          {/* Configurações do Sistema */}
          <section className={styles.section}>
            <h2>Configurações do Sistema</h2>
            
            <Row>
              <Col md={6}>
                <Form.Group className={styles.inputGroup}>
                  <Form.Label>Intervalo entre Agendamentos (minutos)</Form.Label>
                  <Form.Select
                    value={form.intervaloAgendamento}
                    onChange={(e) => handleInputChange('intervaloAgendamento', Number(e.target.value))}
                    className={styles.input}
                  >
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>60 minutos</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className={styles.inputGroup}>
                  <Form.Label>Antecedência Mínima (horas)</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="48"
                    value={form.antecedenciaMinima}
                    onChange={(e) => handleInputChange('antecedenciaMinima', Number(e.target.value))}
                    className={styles.input}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className={styles.inputGroup}>
                  <Form.Label>Antecedência Máxima (dias)</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="90"
                    value={form.antecedenciaMaxima}
                    onChange={(e) => handleInputChange('antecedenciaMaxima', Number(e.target.value))}
                    className={styles.input}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                {form.permiteCancelamento && (
                  <Form.Group className={styles.inputGroup}>
                    <Form.Label>Tempo Limite para Cancelamento (horas)</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      max="48"
                      value={form.tempoLimiteCancelamento}
                      onChange={(e) => handleInputChange('tempoLimiteCancelamento', Number(e.target.value))}
                      className={styles.input}
                    />
                  </Form.Group>
                )}
              </Col>
            </Row>

            <Form.Group className={styles.inputGroup}>
              <Form.Check
                type="checkbox"
                id="permiteCancelamento"
                label="Permitir cancelamento de agendamentos"
                checked={form.permiteCancelamento}
                onChange={(e) => handleInputChange('permiteCancelamento', e.target.checked)}
                className={styles.checkbox}
              />
            </Form.Group>
          </section>

          {/* Mostrar erro de submissão */}
          {errors.submit && (
            <Alert variant="danger" className={styles.errorAlert}>
              {errors.submit}
            </Alert>
          )}

          <div className={styles.buttonGroup}>
            <Button 
              variant="outline-secondary"
              onClick={() => navigate('/')}
              disabled={isSubmitting || loading}
              className={styles.cancelButton}
            >
              Cancelar
            </Button>
            
            <Button 
              type="submit" 
              variant="primary"
              disabled={isSubmitting || loading}
              className={styles.saveButton}
            >
              {isSubmitting ? 'Salvando...' : isConfigured ? 'Atualizar Configurações' : 'Criar Barbearia'}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default ConfigurationPage;
