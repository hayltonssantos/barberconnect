// src/pages/Login/Login.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '@/contexts/UserContext';
import { useConfig } from '@/contexts/ConfigContext';
import type { LoginForm, FormErrors } from '@/types';
import styles from './Login.module.scss';

const Login: React.FC = () => {
  const { user, signIn, error: authError, loading: authLoading, clearError } = useAuth();
  const { contribuinte, setContribuinte } = useConfig();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState<LoginForm>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [validated, setValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pegar contribuinte do state se disponível
  const contribuinteFromState = location.state?.contribuinte;

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/store';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location.state]);

  // Definir contribuinte se veio do state
  useEffect(() => {
    if (contribuinteFromState && !contribuinte) {
      setContribuinte(contribuinteFromState).catch(console.error);
    }
  }, [contribuinteFromState, contribuinte, setContribuinte]);

  // Verificar se tem contribuinte definido
  useEffect(() => {
    if (!contribuinte && !contribuinteFromState) {
      navigate('/', { replace: true });
    }
  }, [contribuinte, contribuinteFromState, navigate]);

  // Limpar erros quando o usuário começar a digitar
  const handleChange = (field: keyof LoginForm, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpar erro do campo específico
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }

    // Limpar erro de autenticação
    if (authError) {
      clearError();
    }
  };

  // Validação do formulário
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar email
    if (!form.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email deve ter um formato válido';
    }

    // Validar senha
    if (!form.password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    } else if (form.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manipular submissão do formulário
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    setValidated(true);

    if (!validateForm()) {
      return;
    }

    if (!contribuinte && !contribuinteFromState) {
      setErrors({ general: 'Contribuinte não definido' });
      return;
    }

    setIsSubmitting(true);

    try {
      await signIn(form.email.trim(), form.password);
      // Redirecionamento será feito pelo useEffect
    } catch (err) {
      // Erro já está sendo tratado pelo contexto
      console.error('Erro no login:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manipular tecla Enter
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      const form = event.currentTarget.closest('form');
      if (form) {
        form.requestSubmit();
      }
    }
  };

  const displayContribuinte = contribuinte || contribuinteFromState;

  return (
    <div className={styles.loginPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Barber Connect</h1>
          {displayContribuinte && (
            <p className={styles.contribuinteInfo}>
              Contribuinte: <span>{displayContribuinte}</span>
            </p>
          )}
        </div>

        {/* Mostrar erro geral */}
        {(errors.general || authError) && (
          <Alert variant="danger" className={styles.alert}>
            {errors.general || authError}
          </Alert>
        )}

        <Form 
          noValidate 
          validated={validated} 
          onSubmit={handleSubmit}
          onKeyPress={handleKeyPress}
          className={styles.form}
        >
          <Row className="mb-3 justify-content-center">
            <Col xs={12}>
              <Form.Group controlId="formBasicEmail">
                <Form.Label>Email *</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="Digite seu email"
                  isInvalid={!!errors.email}
                  isValid={validated && !errors.email && form.email.length > 0}
                  required
                  className={styles.input}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
                <Form.Control.Feedback type="valid">
                  Email válido!
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-4 justify-content-center">
            <Col xs={12}>
              <Form.Group controlId="formBasicPassword">
                <Form.Label>Senha *</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Digite sua senha"
                  isInvalid={!!errors.password}
                  isValid={validated && !errors.password && form.password.length > 0}
                  required
                  className={styles.input}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.password}
                </Form.Control.Feedback>
                <Form.Control.Feedback type="valid">
                  Senha válida!
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="justify-content-center">
            <Col xs={12}>
              <div className="d-grid">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting || authLoading}
                  className={styles.loginButton}
                >
                  {(isSubmitting || authLoading) ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </div>
            </Col>
          </Row>

          {/* Links adicionais */}
          <Row className="mt-4 justify-content-center">
            <Col xs={12} className="text-center">
              <div className={styles.loginLinks}>
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={() => {/* Implementar recuperação de senha */}}
                >
                  Esqueceu sua senha?
                </button>
              </div>
              <div className="mt-2">
                <button 
                  type="button"
                  className={styles.linkButton}
                  onClick={() => navigate('/')}
                >
                  ← Voltar para seleção de contribuinte
                </button>
              </div>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
};

export default Login;
