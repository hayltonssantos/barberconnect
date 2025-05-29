// src/pages/Store/StorePage.tsx
import React, { useState } from 'react';
import { useAuth } from '@/contexts/UserContext';
import { useConfig } from '@/contexts/ConfigContext';
import { useStore } from '@/contexts/StoreContext';
import { useDate } from '@/contexts/DateContext';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Row, Col, Badge } from 'react-bootstrap';
import styles from './StorePage.module.scss';

const StorePage: React.FC = () => {
  const { user } = useAuth();
  const { barbearia } = useConfig();
  const { 
    funcionarios, 
    clientes, 
    servicos, 
    agendamentos,
    selectedFuncionario,
    setSelectedFuncionario,
    getAgendamentosByDate,
    getFuncionariosAtivos,
    loading 
  } = useStore();
  
  const { formatDate, isToday } = useDate();
  const navigate = useNavigate();

  const [selectedView, setSelectedView] = useState<'dashboard' | 'funcionarios' | 'clientes' | 'servicos' | 'agendamentos'>('dashboard');

  // Estatísticas do dashboard
  const hoje = new Date();
  const agendamentosHoje = getAgendamentosByDate(hoje);
  const funcionariosAtivos = getFuncionariosAtivos();
  const clientesAtivos = clientes.filter(c => c.ativo);
  const servicosAtivos = servicos.filter(s => s.ativo);

  const faturamentoHoje = agendamentosHoje
    .filter(apt => apt.status === 'concluido')
    .reduce((total, apt) => total + apt.precoTotal, 0);

  const proximosAgendamentos = agendamentos
    .filter(apt => apt.data >= hoje && apt.status === 'agendado')
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .slice(0, 5);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className="text-center">
          <h2>Carregando dados...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.storePage}>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1>Dashboard - {barbearia?.nomeEstabelecimento}</h1>
            <p>Bem-vindo, {user?.displayName || user?.email?.split('@')[0]}</p>
          </div>
          
          <div className={styles.headerActions}>
            <Button 
              variant="primary" 
              onClick={() => navigate('/create-schedule')}
              className={styles.newScheduleButton}
            >
              + Nova Marcação
            </Button>
          </div>
        </header>

        {/* Navigation */}
        <nav className={styles.navigation}>
          {[
            { key: 'dashboard', label: 'Dashboard', icon: '📊' },
            { key: 'funcionarios', label: 'Funcionários', icon: '👥' },
            { key: 'clientes', label: 'Clientes', icon: '👤' },
            { key: 'servicos', label: 'Serviços', icon: '✂️' },
            { key: 'agendamentos', label: 'Agendamentos', icon: '📅' }
          ].map(item => (
            <button
              key={item.key}
              className={`${styles.navButton} ${selectedView === item.key ? styles.active : ''}`}
              onClick={() => setSelectedView(item.key as any)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <main className={styles.content}>
          {selectedView === 'dashboard' && (
            <div className={styles.dashboard}>
              {/* Cards de Estatísticas */}
              <Row className="mb-4">
                <Col md={3}>
                  <Card className={styles.statCard}>
                    <Card.Body>
                      <div className={styles.statIcon}>👥</div>
                      <div className={styles.statInfo}>
                        <h3>Funcionários</h3>
                        <span className={styles.statNumber}>{funcionariosAtivos.length}</span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={3}>
                  <Card className={styles.statCard}>
                    <Card.Body>
                      <div className={styles.statIcon}>👤</div>
                      <div className={styles.statInfo}>
                        <h3>Clientes</h3>
                        <span className={styles.statNumber}>{clientesAtivos.length}</span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={3}>
                  <Card className={styles.statCard}>
                    <Card.Body>
                      <div className={styles.statIcon}>✂️</div>
                      <div className={styles.statInfo}>
                        <h3>Serviços</h3>
                        <span className={styles.statNumber}>{servicosAtivos.length}</span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={3}>
                  <Card className={styles.statCard}>
                    <Card.Body>
                      <div className={styles.statIcon}>💰</div>
                      <div className={styles.statInfo}>
                        <h3>Faturamento Hoje</h3>
                        <span className={styles.statNumber}>R$ {faturamentoHoje.toFixed(2)}</span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Agendamentos de Hoje */}
              <Row>
                <Col md={8}>
                  <Card className={styles.todayCard}>
                    <Card.Header>
                      <h3>Agendamentos de Hoje ({agendamentosHoje.length})</h3>
                    </Card.Header>
                    <Card.Body>
                      {agendamentosHoje.length === 0 ? (
                        <div className={styles.emptyState}>
                          <p>Nenhum agendamento para hoje</p>
                        </div>
                      ) : (
                        <div className={styles.appointmentsList}>
                          {agendamentosHoje.map(agendamento => {
                            const cliente = clientes.find(c => c.id === agendamento.clienteId);
                            const funcionario = funcionarios.find(f => f.id === agendamento.funcionarioId);
                            const servicosAgendamento = servicos.filter(s => 
                              agendamento.servicoIds.includes(s.id)
                            );

                            return (
                              <div key={agendamento.id} className={styles.appointmentCard}>
                                <div className={styles.appointmentTime}>
                                  <span>{agendamento.horarioInicio}</span>
                                  <span className={styles.duration}>
                                    {servicosAgendamento.reduce((total, s) => total + s.duracao, 0)}min
                                  </span>
                                </div>
                                
                                <div className={styles.appointmentInfo}>
                                  <h4>{cliente?.nome || 'Cliente não encontrado'}</h4>
                                  <p>Funcionário: {funcionario?.nome}</p>
                                  <p>Serviços: {servicosAgendamento.map(s => s.nome).join(', ')}</p>
                                </div>
                                
                                <div className={styles.appointmentStatus}>
                                  <Badge 
                                    bg={
                                      agendamento.status === 'agendado' ? 'warning' :
                                      agendamento.status === 'confirmado' ? 'success' :
                                      agendamento.status === 'concluido' ? 'primary' :
                                      'danger'
                                    }
                                  >
                                    {agendamento.status.replace('_', ' ').toUpperCase()}
                                  </Badge>
                                  <span className={styles.price}>R$ {agendamento.precoTotal.toFixed(2)}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4}>
                  <Card className={styles.upcomingCard}>
                    <Card.Header>
                      <h3>Próximos Agendamentos</h3>
                    </Card.Header>
                    <Card.Body>
                      {proximosAgendamentos.length === 0 ? (
                        <div className={styles.emptyState}>
                          <p>Nenhum agendamento próximo</p>
                        </div>
                      ) : (
                        <div className={styles.upcomingList}>
                          {proximosAgendamentos.map(agendamento => {
                            const cliente = clientes.find(c => c.id === agendamento.clienteId);
                            
                            return (
                              <div key={agendamento.id} className={styles.upcomingItem}>
                                <div className={styles.upcomingDate}>
                                  {formatDate(agendamento.data, 'DD/MM')}
                                </div>
                                <div className={styles.upcomingInfo}>
                                  <span className={styles.upcomingTime}>{agendamento.horarioInicio}</span>
                                  <span className={styles.upcomingClient}>{cliente?.nome}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          )}

          {selectedView === 'funcionarios' && (
            <div className={styles.funcionariosSection}>
              <div className={styles.sectionHeader}>
                <h2>Funcionários</h2>
                <Button variant="primary">+ Adicionar Funcionário</Button>
              </div>
              
              <Row>
                {funcionariosAtivos.map(funcionario  => (
                  <Col key={funcionario.id} md={4} className="mb-3">
                    <Card className={styles.funcionarioCard}>
                      <Card.Body>
                        <div className={styles.funcionarioAvatar}>
                          {funcionario.nome.charAt(0)}
                        </div>
                        <h4>{funcionario.nome}</h4>
                        <p>{funcionario.email}</p>
                        <p>{funcionario.telefone}</p>
                        
                        <div className={styles.especialidades}>
                          {funcionario.especialidades.map(esp => (
                            <Badge key={esp} bg="secondary" className="me-1">
                              {esp}
                            </Badge>
                          ))}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {selectedView === 'clientes' && (
            <div className={styles.clientesSection}>
              <div className={styles.sectionHeader}>
                <h2>Clientes</h2>
                <Button variant="primary">+ Adicionar Cliente</Button>
              </div>
              
              <div className={styles.clientesList}>
                {clientesAtivos.map(cliente => (
                  <Card key={cliente.id} className={styles.clienteCard}>
                    <Card.Body>
                      <Row>
                        <Col md={8}>
                          <h4>{cliente.nome}</h4>
                          <p>{cliente.email}</p>
                          <p>{cliente.telefone}</p>
                        </Col>
                        <Col md={4} className="text-end">
                          <p>Visitas: {cliente.totalVisitas}</p>
                          {cliente.ultimaVisita && (
                            <p>Última: {formatDate(cliente.ultimaVisita, 'DD/MM/YYYY')}</p>
                          )}
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {selectedView === 'servicos' && (
            <div className={styles.servicosSection}>
              <div className={styles.sectionHeader}>
                <h2>Serviços</h2>
                <Button variant="primary">+ Adicionar Serviço</Button>
              </div>
              
              <Row>
                {servicosAtivos.map(servico => (
                  <Col key={servico.id} md={4} className="mb-3">
                    <Card className={styles.servicoCard}>
                      <Card.Body>
                        <div className={styles.servicoHeader}>
                          <h4>{servico.nome}</h4>
                          <Badge bg="info">{servico.categoria}</Badge>
                        </div>
                        <p>{servico.descricao}</p>
                        <div className={styles.servicoDetails}>
                          <span>{servico.duracao} min</span>
                          <span className={styles.servicoPrice}>R$ {servico.preco.toFixed(2)}</span>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {selectedView === 'agendamentos' && (
            <div className={styles.agendamentosSection}>
              <div className={styles.sectionHeader}>
                <h2>Todos os Agendamentos</h2>
                <Button variant="primary" onClick={() => navigate('/create-schedule')}>
                  + Novo Agendamento
                </Button>
              </div>
              
              <div className={styles.agendamentosList}>
                {agendamentos.slice(0, 10).map(agendamento => {
                  const cliente = clientes.find(c => c.id === agendamento.clienteId);
                  const funcionario = funcionarios.find(f => f.id === agendamento.funcionarioId);
                  
                  return (
                    <Card key={agendamento.id} className={styles.agendamentoCard}>
                      <Card.Body>
                        <Row>
                          <Col md={2}>
                            <div className={styles.agendamentoDate}>
                              {formatDate(agendamento.data, 'DD/MM')}
                              <br />
                              {agendamento.horarioInicio}
                            </div>
                          </Col>
                          <Col md={6}>
                            <h5>{cliente?.nome}</h5>
                            <p>Funcionário: {funcionario?.nome}</p>
                          </Col>
                          <Col md={2}>
                            <Badge 
                              bg={
                                agendamento.status === 'agendado' ? 'warning' :
                                agendamento.status === 'confirmado' ? 'success' :
                                agendamento.status === 'concluido' ? 'primary' :
                                'danger'
                              }
                            >
                              {agendamento.status.toUpperCase()}
                            </Badge>
                          </Col>
                          <Col md={2} className="text-end">
                            <strong>R$ {agendamento.precoTotal.toFixed(2)}</strong>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StorePage;
