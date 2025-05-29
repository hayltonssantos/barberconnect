// src/pages/CreateSchedule/CreateSchedule.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Row, Col, Button, Card, Alert, Modal } from 'react-bootstrap';
import { useAuth } from '@/contexts/UserContext';
import { useConfig } from '@/contexts/ConfigContext';
import { useStore } from '@/contexts/StoreContext';
import { useDate } from '@/contexts/DateContext';
import type { Cliente, Funcionario, Servico, Agendamento, FormErrors } from '@/types';
import styles from './CreateSchedule.module.scss';

interface AgendamentoForm {
  clienteId: string;
  funcionarioId: string;
  servicoIds: string[];
  data: Date | null;
  horarioInicio: string;
  observacoes: string;
  novoCliente: {
    nome: string;
    email: string;
    telefone: string;
  };
}

const CreateSchedule: React.FC = () => {
  const { user } = useAuth();
  const { barbearia } = useConfig();
  const { 
    funcionarios, 
    clientes, 
    servicos, 
    createAgendamento, 
    addCliente,
    calculateTotalPrice,
    loading,
    error 
  } = useStore();
  
  const { 
    formatDate, 
    formatTime, 
    isToday, 
    isPast, 
    isWorkingDay,
    getTimeSlots 
  } = useDate();
  
  const navigate = useNavigate();

  const [form, setForm] = useState<AgendamentoForm>({
    clienteId: '',
    funcionarioId: '',
    servicoIds: [],
    data: null,
    horarioInicio: '',
    observacoes: '',
    novoCliente: {
      nome: '',
      email: '',
      telefone: ''
    }
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [selectedStep, setSelectedStep] = useState<'cliente' | 'funcionario' | 'servicos' | 'data' | 'horario' | 'confirmacao'>('cliente');

  // Calcular duração total e preço
  const selectedServicos = servicos.filter(s => form.servicoIds.includes(s.id));
  const duracaoTotal = selectedServicos.reduce((total, s) => total + s.duracao, 0);
  const precoTotal = calculateTotalPrice(form.servicoIds);

  // Gerar horários disponíveis quando data e funcionário são selecionados
  useEffect(() => {
    if (form.data && form.funcionarioId && barbearia) {
      generateAvailableTimeSlots();
    }
  }, [form.data, form.funcionarioId, selectedServicos]);

  const generateAvailableTimeSlots = () => {
    if (!form.data || !barbearia) return;

    const dayName = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'][form.data.getDay()];
    
    // Verificar se é dia de funcionamento
    if (!isWorkingDay(form.data, barbearia.horarioFuncionamento.diasFuncionamento)) {
      setAvailableTimeSlots([]);
      return;
    }

    // Gerar slots baseado no horário de funcionamento
    const slots = getTimeSlots(
      form.data,
      barbearia.horarioFuncionamento.abertura,
      barbearia.horarioFuncionamento.fechamento,
      barbearia.configuracoesSistema.intervaloAgendamento
    );

    // Filtrar slots já ocupados (aqui você implementaria a lógica de verificação)
    // Por enquanto, retornamos todos os slots
    setAvailableTimeSlots(slots);
  };

  const handleInputChange = (field: keyof AgendamentoForm, value: any) => {
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

  const handleNewClientChange = (field: keyof AgendamentoForm['novoCliente'], value: string) => {
    setForm(prev => ({
      ...prev,
      novoCliente: {
        ...prev.novoCliente,
        [field]: value
      }
    }));
  };

  const handleServicoToggle = (servicoId: string) => {
    const newServicos = form.servicoIds.includes(servicoId)
      ? form.servicoIds.filter(id => id !== servicoId)
      : [...form.servicoIds, servicoId];
    
    handleInputChange('servicoIds', newServicos);
  };

  const createNewClient = async () => {
    setIsCreatingClient(true);
    
    try {
      const clienteId = await addCliente({
        nome: form.novoCliente.nome,
        email: form.novoCliente.email,
        telefone: form.novoCliente.telefone,
        ativo: true
      });

      handleInputChange('clienteId', clienteId);
      setShowNewClientModal(false);
      setForm(prev => ({
        ...prev,
        novoCliente: { nome: '', email: '', telefone: '' }
      }));
    } catch (error: any) {
      setErrors({ newClient: error.message });
    } finally {
      setIsCreatingClient(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.clienteId) {
      newErrors.clienteId = 'Selecione um cliente';
    }

    if (!form.funcionarioId) {
      newErrors.funcionarioId = 'Selecione um funcionário';
    }

    if (form.servicoIds.length === 0) {
      newErrors.servicoIds = 'Selecione pelo menos um serviço';
    }

    if (!form.data) {
      newErrors.data = 'Selecione uma data';
    } else if (isPast(form.data)) {
      newErrors.data = 'Data não pode ser no passado';
    }

    if (!form.horarioInicio) {
      newErrors.horarioInicio = 'Selecione um horário';
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
      // Calcular horário de fim
      const [horas, minutos] = form.horarioInicio.split(':').map(Number);
      const dataInicio = new Date(form.data!);
      dataInicio.setHours(horas, minutos, 0, 0);
      
      const dataFim = new Date(dataInicio);
      dataFim.setMinutes(dataFim.getMinutes() + duracaoTotal);

      const agendamentoData: Omit<Agendamento, keyof import('@/types').BaseEntity> = {
        clienteId: form.clienteId,
        funcionarioId: form.funcionarioId,
        servicoIds: form.servicoIds,
        data: form.data!,
        horarioInicio: form.horarioInicio,
        horarioFim: formatTime(dataFim),
        status: 'agendado',
        observacoes: form.observacoes,
        precoTotal,
        pago: false
      };

      await createAgendamento(agendamentoData);

      setShowSuccess(true);
      setTimeout(() => {
        navigate('/store');
      }, 2000);

    } catch (error: any) {
      console.error('Erro ao criar agendamento:', error);
      setErrors({ submit: error.message || 'Erro ao criar agendamento' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    const steps: typeof selectedStep[] = ['cliente', 'funcionario', 'servicos', 'data', 'horario', 'confirmacao'];
    const currentIndex = steps.indexOf(selectedStep);
    if (currentIndex < steps.length - 1) {
      setSelectedStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: typeof selectedStep[] = ['cliente', 'funcionario', 'servicos', 'data', 'horario', 'confirmacao'];
    const currentIndex = steps.indexOf(selectedStep);
    if (currentIndex > 0) {
      setSelectedStep(steps[currentIndex - 1]);
    }
  };

  const canProceed = () => {
    switch (selectedStep) {
      case 'cliente': return !!form.clienteId;
      case 'funcionario': return !!form.funcionarioId;
      case 'servicos': return form.servicoIds.length > 0;
      case 'data': return !!form.data;
      case 'horario': return !!form.horarioInicio;
      default: return true;
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <h2>Carregando dados...</h2>
      </div>
    );
  }

  return (
    <div className={styles.createSchedulePage}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Nova Marcação</h1>
          <p>Agende um horário para seu cliente</p>
        </header>

        {showSuccess && (
          <Alert variant="success" className={styles.successAlert}>
            ✓ Agendamento criado com sucesso! Redirecionando...
          </Alert>
        )}

        {error && (
          <Alert variant="danger" className={styles.errorAlert}>
            {error}
          </Alert>
        )}

        {/* Progress Steps */}
        <div className={styles.progressSteps}>
          {[
            { key: 'cliente', label: 'Cliente', icon: '👤' },
            { key: 'funcionario', label: 'Funcionário', icon: '👨‍💼' },
            { key: 'servicos', label: 'Serviços', icon: '✂️' },
            { key: 'data', label: 'Data', icon: '📅' },
            { key: 'horario', label: 'Horário', icon: '⏰' },
            { key: 'confirmacao', label: 'Confirmação', icon: '✅' }
          ].map((step, index) => (
            <div 
              key={step.key}
              className={`${styles.step} ${selectedStep === step.key ? styles.active : ''} ${
                ['cliente', 'funcionario', 'servicos', 'data', 'horario'].indexOf(selectedStep) > index ? styles.completed : ''
              }`}
              onClick={() => setSelectedStep(step.key as any)}
            >
              <div className={styles.stepIcon}>{step.icon}</div>
              <span className={styles.stepLabel}>{step.label}</span>
            </div>
          ))}
        </div>

        <Form onSubmit={handleSubmit} className={styles.form}>
          {/* Step 1: Cliente */}
          {selectedStep === 'cliente' && (
            <Card className={styles.stepCard}>
              <Card.Header>
                <h3>Selecionar Cliente</h3>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={8}>
                    <Form.Group className={styles.inputGroup}>
                      <Form.Label>Cliente *</Form.Label>
                      <Form.Select
                        value={form.clienteId}
                        onChange={(e) => handleInputChange('clienteId', e.target.value)}
                        isInvalid={!!errors.clienteId}
                        className={styles.input}
                      >
                        <option value="">Selecione um cliente</option>
                        {clientes.map(cliente => (
                          <option key={cliente.id} value={cliente.id}>
                            {cliente.nome} - {cliente.telefone}
                          </option>
                        ))}
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.clienteId}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <div className={styles.newClientSection}>
                      <Button 
                        variant="outline-primary"
                        onClick={() => setShowNewClientModal(true)}
                        className={styles.newClientButton}
                      >
                        + Novo Cliente
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {/* Step 2: Funcionário */}
          {selectedStep === 'funcionario' && (
            <Card className={styles.stepCard}>
              <Card.Header>
                <h3>Selecionar Funcionário</h3>
              </Card.Header>
              <Card.Body>
                <Row>
                  {funcionarios.filter(f => f.ativo).map(funcionario => (
                    <Col key={funcionario.id} md={6} lg={4} className="mb-3">
                      <div 
                        className={`${styles.funcionarioCard} ${form.funcionarioId === funcionario.id ? styles.selected : ''}`}
                        onClick={() => handleInputChange('funcionarioId', funcionario.id)}
                      >
                        <div className={styles.funcionarioAvatar}>
                          {funcionario.nome.charAt(0)}
                        </div>
                        <h4>{funcionario.nome}</h4>
                        <div className={styles.especialidades}>
                          {funcionario.especialidades.map(esp => (
                            <span key={esp} className={styles.especialidadeTag}>
                              {esp}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
                {errors.funcionarioId && (
                  <div className={styles.errorMessage}>{errors.funcionarioId}</div>
                )}
              </Card.Body>
            </Card>
          )}

          {/* Step 3: Serviços */}
          {selectedStep === 'servicos' && (
            <Card className={styles.stepCard}>
              <Card.Header>
                <h3>Selecionar Serviços</h3>
              </Card.Header>
              <Card.Body>
                <Row>
                  {servicos.filter(s => s.ativo).map(servico => (
                    <Col key={servico.id} md={6} lg={4} className="mb-3">
                      <div 
                        className={`${styles.servicoCard} ${form.servicoIds.includes(servico.id) ? styles.selected : ''}`}
                        onClick={() => handleServicoToggle(servico.id)}
                      >
                        <div className={styles.servicoHeader}>
                          <h4>{servico.nome}</h4>
                          <span className={styles.servicoCategoria}>{servico.categoria}</span>
                        </div>
                        <p className={styles.servicoDescricao}>{servico.descricao}</p>
                        <div className={styles.servicoDetails}>
                          <span className={styles.servicoDuracao}>{servico.duracao} min</span>
                          <span className={styles.servicoPreco}>R$ {servico.preco.toFixed(2)}</span>
                        </div>
                        {form.servicoIds.includes(servico.id) && (
                          <div className={styles.selectedIcon}>✓</div>
                        )}
                      </div>
                    </Col>
                  ))}
                </Row>
                
                {selectedServicos.length > 0 && (
                  <div className={styles.servicosSummary}>
                    <h5>Serviços Selecionados:</h5>
                    <div className={styles.summaryDetails}>
                      <span>Duração Total: {duracaoTotal} minutos</span>
                      <span>Preço Total: R$ {precoTotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}
                
                {errors.servicoIds && (
                  <div className={styles.errorMessage}>{errors.servicoIds}</div>
                )}
              </Card.Body>
            </Card>
          )}

          {/* Step 4: Data */}
          {selectedStep === 'data' && (
            <Card className={styles.stepCard}>
              <Card.Header>
                <h3>Selecionar Data</h3>
              </Card.Header>
              <Card.Body>
                <Form.Group className={styles.inputGroup}>
                  <Form.Label>Data do Agendamento *</Form.Label>
                  <Form.Control
                    type="date"
                    value={form.data ? form.data.toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value + 'T00:00:00') : null;
                      handleInputChange('data', date);
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    isInvalid={!!errors.data}
                    className={styles.input}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.data}
                  </Form.Control.Feedback>
                </Form.Group>

                {form.data && barbearia && (
                  <div className={styles.dateInfo}>
                    <p>
                      <strong>Data selecionada:</strong> {formatDate(form.data, 'dddd, DD [de] MMMM [de] YYYY')}
                    </p>
                    {!isWorkingDay(form.data, barbearia.horarioFuncionamento.diasFuncionamento) && (
                      <Alert variant="warning">
                        Esta data não está nos dias de funcionamento da barbearia.
                      </Alert>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

          {/* Step 5: Horário */}
          {selectedStep === 'horario' && (
            <Card className={styles.stepCard}>
              <Card.Header>
                <h3>Selecionar Horário</h3>
              </Card.Header>
              <Card.Body>
                {availableTimeSlots.length === 0 ? (
                  <Alert variant="info">
                    Nenhum horário disponível para a data selecionada.
                  </Alert>
                ) : (
                  <div className={styles.timeSlots}>
                    {availableTimeSlots.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        className={`${styles.timeSlot} ${form.horarioInicio === slot ? styles.selected : ''}`}
                        onClick={() => handleInputChange('horarioInicio', slot)}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
                
                {errors.horarioInicio && (
                  <div className={styles.errorMessage}>{errors.horarioInicio}</div>
                )}
              </Card.Body>
            </Card>
          )}

          {/* Step 6: Confirmação */}
          {selectedStep === 'confirmacao' && (
            <Card className={styles.stepCard}>
              <Card.Header>
                <h3>Confirmar Agendamento</h3>
              </Card.Header>
              <Card.Body>
                <div className={styles.confirmationSummary}>
                  <div className={styles.summarySection}>
                    <h5>Cliente:</h5>
                    <p>{clientes.find(c => c.id === form.clienteId)?.nome}</p>
                  </div>
                  
                  <div className={styles.summarySection}>
                    <h5>Funcionário:</h5>
                    <p>{funcionarios.find(f => f.id === form.funcionarioId)?.nome}</p>
                  </div>
                  
                  <div className={styles.summarySection}>
                    <h5>Serviços:</h5>
                    <ul>
                      {selectedServicos.map(servico => (
                        <li key={servico.id}>
                          {servico.nome} - {servico.duracao}min - R$ {servico.preco.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className={styles.summarySection}>
                    <h5>Data e Horário:</h5>
                    <p>
                      {form.data && formatDate(form.data, 'DD/MM/YYYY')} às {form.horarioInicio}
                    </p>
                    <p>Duração total: {duracaoTotal} minutos</p>
                  </div>
                  
                  <div className={styles.summarySection}>
                    <h5>Valor Total:</h5>
                    <p className={styles.totalPrice}>R$ {precoTotal.toFixed(2)}</p>
                  </div>
                </div>

                <Form.Group className={styles.inputGroup}>
                  <Form.Label>Observações</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={form.observacoes}
                    onChange={(e) => handleInputChange('observacoes', e.target.value)}
                    placeholder="Observações adicionais (opcional)"
                    className={styles.input}
                  />
                </Form.Group>

                {errors.submit && (
                  <Alert variant="danger" className={styles.errorAlert}>
                    {errors.submit}
                  </Alert>
                )}
              </Card.Body>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className={styles.navigationButtons}>
            <Button 
              variant="outline-secondary"
              onClick={prevStep}
              disabled={selectedStep === 'cliente'}
              className={styles.navButton}
            >
              ← Anterior
            </Button>

            {selectedStep !== 'confirmacao' ? (
              <Button 
                variant="primary"
                onClick={nextStep}
                disabled={!canProceed()}
                className={styles.navButton}
              >
                Próximo →
              </Button>
            ) : (
              <Button 
                type="submit"
                variant="success"
                disabled={isSubmitting || !canProceed()}
                className={styles.submitButton}
              >
                {isSubmitting ? 'Criando...' : 'Confirmar Agendamento'}
              </Button>
            )}
          </div>
        </Form>

        {/* Modal Novo Cliente */}
        <Modal show={showNewClientModal} onHide={() => setShowNewClientModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Novo Cliente</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nome *</Form.Label>
                    <Form.Control
                      type="text"
                      value={form.novoCliente.nome}
                      onChange={(e) => handleNewClientChange('nome', e.target.value)}
                      placeholder="Nome completo"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Telefone *</Form.Label>
                    <Form.Control
                      type="tel"
                      value={form.novoCliente.telefone}
                      onChange={(e) => handleNewClientChange('telefone', e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Email *</Form.Label>
                <Form.Control
                  type="email"
                  value={form.novoCliente.email}
                  onChange={(e) => handleNewClientChange('email', e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </Form.Group>
            </Form>
            
            {errors.newClient && (
              <Alert variant="danger">{errors.newClient}</Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowNewClientModal(false)}>
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              onClick={createNewClient}
              disabled={isCreatingClient || !form.novoCliente.nome || !form.novoCliente.email || !form.novoCliente.telefone}
            >
              {isCreatingClient ? 'Criando...' : 'Criar Cliente'}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default CreateSchedule;
