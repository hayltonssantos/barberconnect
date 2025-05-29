// src/pages/Funcionarios/FuncionariosPage.tsx
import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Button, Card, Alert, Modal, Badge } from 'react-bootstrap';
import { useAuth } from '@/contexts/UserContext';
import { useConfig } from '@/contexts/ConfigContext';
import { useStore } from '@/contexts/StoreContext';
import type { Funcionario, FormErrors, HorarioTrabalho, DiaSemana } from '@/types';
import styles from './FuncionariosPage.module.scss';

interface FuncionarioForm {
  nome: string;
  email: string;
  telefone: string;
  especialidades: string[];
  horarioTrabalho: HorarioTrabalho;
  salario: number;
  comissao: number;
}

const FuncionariosPage: React.FC = () => {
  const { user } = useAuth();
  const { barbearia } = useConfig();
  const { 
    funcionarios, 
    addFuncionario, 
    updateFuncionario, 
    removeFuncionario,
    getFuncionariosAtivos,
    loading,
    error 
  } = useStore();

  const [showModal, setShowModal] = useState(false);
  const [editingFuncionario, setEditingFuncionario] = useState<Funcionario | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [form, setForm] = useState<FuncionarioForm>({
    nome: '',
    email: '',
    telefone: '',
    especialidades: [],
    horarioTrabalho: {},
    salario: 0,
    comissao: 0
  });

  const diasSemana: DiaSemana[] = [
    'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'
  ];

  const especialidadesDisponiveis = [
    'Corte Masculino',
    'Corte Feminino',
    'Barba',
    'Bigode',
    'Sobrancelha',
    'Coloração',
    'Luzes',
    'Escova',
    'Penteado',
    'Tratamento Capilar'
  ];

  const funcionariosAtivos = getFuncionariosAtivos().filter(f => !f.nome.includes('Todos'));

  useEffect(() => {
    if (editingFuncionario) {
      setForm({
        nome: editingFuncionario.nome,
        email: editingFuncionario.email || '',
        telefone: editingFuncionario.telefone || '',
        especialidades: editingFuncionario.especialidades,
        horarioTrabalho: editingFuncionario.horarioTrabalho,
        salario: editingFuncionario.salario || 0,
        comissao: editingFuncionario.comissao || 0
      });
    } else {
      resetForm();
    }
  }, [editingFuncionario]);

  const resetForm = () => {
    setForm({
      nome: '',
      email: '',
      telefone: '',
      especialidades: [],
      horarioTrabalho: {},
      salario: 0,
      comissao: 0
    });
    setErrors({});
  };

  const handleInputChange = (field: keyof FuncionarioForm, value: any) => {
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

  const handleEspecialidadeToggle = (especialidade: string) => {
    const newEspecialidades = form.especialidades.includes(especialidade)
      ? form.especialidades.filter(e => e !== especialidade)
      : [...form.especialidades, especialidade];
    
    handleInputChange('especialidades', newEspecialidades);
  };

  const handleHorarioChange = (dia: DiaSemana, field: 'inicio' | 'fim' | 'trabalhando', value: string | boolean) => {
    const newHorario = {
      ...form.horarioTrabalho,
      [dia]: {
        ...form.horarioTrabalho[dia],
        [field]: value
      }
    };

    // Se não está trabalhando, limpar horários
    if (field === 'trabalhando' && !value) {
      newHorario[dia] = {
        inicio: '',
        fim: '',
        trabalhando: false
      };
    }

    handleInputChange('horarioTrabalho', newHorario);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email deve ter um formato válido';
    }

    if (form.especialidades.length === 0) {
      newErrors.especialidades = 'Selecione pelo menos uma especialidade';
    }

    // Validar horários de trabalho
    const diasTrabalhando = Object.keys(form.horarioTrabalho).filter(
      dia => form.horarioTrabalho[dia]?.trabalhando
    );

    if (diasTrabalhando.length === 0) {
      newErrors.horarioTrabalho = 'Defina pelo menos um dia de trabalho';
    } else {
      // Verificar se os horários estão preenchidos para dias que trabalha
      for (const dia of diasTrabalhando) {
        const horario = form.horarioTrabalho[dia];
        if (!horario?.inicio || !horario?.fim) {
          newErrors.horarioTrabalho = 'Preencha os horários para todos os dias de trabalho';
          break;
        }
        if (horario.inicio >= horario.fim) {
          newErrors.horarioTrabalho = 'Horário de início deve ser anterior ao fim';
          break;
        }
      }
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
      const funcionarioData: Omit<Funcionario, keyof import('@/types').BaseEntity> = {
        nome: form.nome,
        email: form.email || undefined,
        telefone: form.telefone || undefined,
        especialidades: form.especialidades,
        horarioTrabalho: form.horarioTrabalho,
        salario: form.salario || undefined,
        comissao: form.comissao || undefined
      };

      if (editingFuncionario) {
        await updateFuncionario(editingFuncionario.id, funcionarioData);
      } else {
        await addFuncionario(funcionarioData);
      }

      setShowSuccess(true);
      setShowModal(false);
      setEditingFuncionario(null);
      resetForm();

      setTimeout(() => setShowSuccess(false), 3000);

    } catch (error: any) {
      console.error('Erro ao salvar funcionário:', error);
      setErrors({ submit: error.message || 'Erro ao salvar funcionário' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (funcionario: Funcionario) => {
    setEditingFuncionario(funcionario);
    setShowModal(true);
  };

  const handleDelete = async (funcionario: Funcionario) => {
    if (window.confirm(`Tem certeza que deseja remover ${funcionario.nome}?`)) {
      try {
        await removeFuncionario(funcionario.id);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (error: any) {
        setErrors({ general: error.message || 'Erro ao remover funcionário' });
      }
    }
  };

  const openNewModal = () => {
    setEditingFuncionario(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingFuncionario(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <h2>Carregando funcionários...</h2>
      </div>
    );
  }

  return (
    <div className={styles.funcionariosPage}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1>Gerenciar Funcionários</h1>
            <p>Cadastre e gerencie os funcionários da {barbearia?.nomeEstabelecimento}</p>
          </div>
          <Button 
            variant="primary" 
            onClick={openNewModal}
            className={styles.newButton}
          >
            + Novo Funcionário
          </Button>
        </header>

        {showSuccess && (
          <Alert variant="success" className={styles.successAlert}>
            ✓ Operação realizada com sucesso!
          </Alert>
        )}

        {error && (
          <Alert variant="danger" className={styles.errorAlert}>
            {error}
          </Alert>
        )}

        {errors.general && (
          <Alert variant="danger" className={styles.errorAlert}>
            {errors.general}
          </Alert>
        )}

        {/* Lista de Funcionários */}
        <div className={styles.funcionariosList}>
          {funcionariosAtivos.length === 0 ? (
            <Card className={styles.emptyState}>
              <Card.Body>
                <div className={styles.emptyContent}>
                  <h3>Nenhum funcionário cadastrado</h3>
                  <p>Comece adicionando o primeiro funcionário da sua barbearia</p>
                  <Button variant="primary" onClick={openNewModal}>
                    Adicionar Funcionário
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ) : (
            <Row>
              {funcionariosAtivos.map(funcionario => (
                <Col key={funcionario.id} lg={6} xl={4} className="mb-4">
                  <Card className={styles.funcionarioCard}>
                    <Card.Body>
                      <div className={styles.funcionarioHeader}>
                        <div className={styles.funcionarioAvatar}>
                          {funcionario.nome.charAt(0)}
                        </div>
                        <div className={styles.funcionarioInfo}>
                          <h4>{funcionario.nome}</h4>
                          {funcionario.email && (
                            <p className={styles.funcionarioEmail}>{funcionario.email}</p>
                          )}
                          {funcionario.telefone && (
                            <p className={styles.funcionarioTelefone}>{funcionario.telefone}</p>
                          )}
                        </div>
                      </div>

                      <div className={styles.especialidades}>
                        <h5>Especialidades:</h5>
                        <div className={styles.especialidadesTags}>
                          {funcionario.especialidades.map(esp => (
                            <Badge key={esp} bg="secondary" className={styles.especialidadeTag}>
                              {esp}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className={styles.horarioResumo}>
                        <h5>Dias de Trabalho:</h5>
                        <div className={styles.diasTrabalho}>
                          {diasSemana.map(dia => {
                            const horario = funcionario.horarioTrabalho[dia];
                            const trabalhando = horario?.trabalhando;
                            
                            return (
                              <span 
                                key={dia}
                                className={`${styles.diaTag} ${trabalhando ? styles.ativo : styles.inativo}`}
                              >
                                {dia.charAt(0).toUpperCase()}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {(funcionario.salario || funcionario.comissao) && (
                        <div className={styles.financeiro}>
                          {funcionario.salario && (
                            <p>Salário: R$ {funcionario.salario.toFixed(2)}</p>
                          )}
                          {funcionario.comissao && (
                            <p>Comissão: {funcionario.comissao}%</p>
                          )}
                        </div>
                      )}

                      <div className={styles.funcionarioActions}>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => handleEdit(funcionario)}
                        >
                          Editar
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDelete(funcionario)}
                        >
                          Remover
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>

        {/* Modal de Funcionário */}
        <Modal show={showModal} onHide={closeModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              {editingFuncionario ? 'Editar Funcionário' : 'Novo Funcionário'}
            </Modal.Title>
          </Modal.Header>
          
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              {/* Dados Básicos */}
              <Card className={styles.modalSection}>
                <Card.Header>
                  <h5>Dados Básicos</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nome *</Form.Label>
                        <Form.Control
                          type="text"
                          value={form.nome}
                          onChange={(e) => handleInputChange('nome', e.target.value)}
                          placeholder="Nome completo"
                          isInvalid={!!errors.nome}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.nome}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          value={form.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="email@exemplo.com"
                          isInvalid={!!errors.email}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.email}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Telefone</Form.Label>
                        <Form.Control
                          type="tel"
                          value={form.telefone}
                          onChange={(e) => handleInputChange('telefone', e.target.value)}
                          placeholder="(11) 99999-9999"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>Salário (R$)</Form.Label>
                        <Form.Control
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.salario}
                          onChange={(e) => handleInputChange('salario', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>Comissão (%)</Form.Label>
                        <Form.Control
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={form.comissao}
                          onChange={(e) => handleInputChange('comissao', parseFloat(e.target.value) || 0)}
                          placeholder="0.0"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Especialidades */}
              <Card className={styles.modalSection}>
                <Card.Header>
                  <h5>Especialidades *</h5>
                </Card.Header>
                <Card.Body>
                  <div className={styles.especialidadesGrid}>
                    {especialidadesDisponiveis.map(especialidade => (
                      <Form.Check
                        key={especialidade}
                        type="checkbox"
                        id={`esp-${especialidade}`}
                        label={especialidade}
                        checked={form.especialidades.includes(especialidade)}
                        onChange={() => handleEspecialidadeToggle(especialidade)}
                        className={styles.especialidadeCheck}
                      />
                    ))}
                  </div>
                  {errors.especialidades && (
                    <div className={styles.errorMessage}>{errors.especialidades}</div>
                  )}
                </Card.Body>
              </Card>

              {/* Horário de Trabalho */}
              <Card className={styles.modalSection}>
                <Card.Header>
                  <h5>Horário de Trabalho *</h5>
                </Card.Header>
                <Card.Body>
                  {diasSemana.map(dia => {
                    const horario = form.horarioTrabalho[dia] || { inicio: '', fim: '', trabalhando: false };
                    
                    return (
                      <Row key={dia} className="mb-3 align-items-center">
                        <Col md={2}>
                          <Form.Check
                            type="checkbox"
                            id={`dia-${dia}`}
                            label={dia.charAt(0).toUpperCase() + dia.slice(1)}
                            checked={horario.trabalhando}
                            onChange={(e) => handleHorarioChange(dia, 'trabalhando', e.target.checked)}
                          />
                        </Col>
                        <Col md={4}>
                          <Form.Control
                            type="time"
                            value={horario.inicio}
                            onChange={(e) => handleHorarioChange(dia, 'inicio', e.target.value)}
                            disabled={!horario.trabalhando}
                            placeholder="Início"
                          />
                        </Col>
                        <Col md={1} className="text-center">
                          <span>até</span>
                        </Col>
                        <Col md={4}>
                          <Form.Control
                            type="time"
                            value={horario.fim}
                            onChange={(e) => handleHorarioChange(dia, 'fim', e.target.value)}
                            disabled={!horario.trabalhando}
                            placeholder="Fim"
                          />
                        </Col>
                      </Row>
                    );
                  })}
                  {errors.horarioTrabalho && (
                    <div className={styles.errorMessage}>{errors.horarioTrabalho}</div>
                  )}
                </Card.Body>
              </Card>

              {errors.submit && (
                <Alert variant="danger" className="mt-3">
                  {errors.submit}
                </Alert>
              )}
            </Modal.Body>
            
            <Modal.Footer>
              <Button variant="secondary" onClick={closeModal}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Salvando...' : editingFuncionario ? 'Atualizar' : 'Criar'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default FuncionariosPage;
