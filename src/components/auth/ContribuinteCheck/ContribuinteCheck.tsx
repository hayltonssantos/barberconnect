// src/components/auth/ContribuinteCheck/ContribuinteCheck.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import { useConfig } from '@/contexts/ConfigContext';
import { BarbeariaService } from '@/services/barbeariaService';
import styles from './ContribuinteCheck.module.scss';

interface ContribuinteForm {
  contribuinte: string;
}

interface ContribuinteErrors {
  contribuinte?: string;
  general?: string;
}

const ContribuinteCheck: React.FC = () => {
  const { validateContribuinte } = useConfig();
  const navigate = useNavigate();

  const [form, setForm] = useState<ContribuinteForm>({
    contribuinte: ''
  });

  const [errors, setErrors] = useState<ContribuinteErrors>({});
  const [isChecking, setIsChecking] = useState(false);

  const handleChange = (value: string) => {
    // Permitir apenas números
    const numericValue = value.replace(/\D/g, '');
    
    setForm({ contribuinte: numericValue });
    
    // Limpar erros quando usuário digita
    if (errors.contribuinte || errors.general) {
      setErrors({});
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ContribuinteErrors = {};

    if (!form.contribuinte.trim()) {
      newErrors.contribuinte = 'Contribuinte é obrigatório';
    } else if (!validateContribuinte(form.contribuinte)) {
      newErrors.contribuinte = 'Contribuinte deve conter apenas números (máximo 9 dígitos)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) return;

    setIsChecking(true);
    setErrors({});

    try {
      // Verificar se a barbearia existe
      const barbeariaExists = await BarbeariaService.verificarContribuinte(form.contribuinte);
      
      if (barbeariaExists) {
        // Se existe, vai para login
        navigate('/login', { 
          state: { contribuinte: form.contribuinte },
          replace: true 
        });
      } else {
        // Se não existe, vai para configuração
        navigate('/configuration', { 
          state: { contribuinte: form.contribuinte },
          replace: true 
        });
      }

    } catch (error: any) {
      setErrors({ 
        general: error.message || 'Erro ao verificar contribuinte' 
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className={styles.contribuinteCheck}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Barber Connect</h1>
          <p>Digite o contribuinte da sua barbearia para continuar</p>
        </div>

        {errors.general && (
          <Alert variant="danger" className={styles.alert}>
            {errors.general}
          </Alert>
        )}

        <Form onSubmit={handleSubmit} className={styles.form}>
          <Row className="justify-content-center">
            <Col xs={12} sm={10} md={8} lg={6}>
              <Form.Group controlId="contribuinte">
                <Form.Label>Contribuinte *</Form.Label>
                <Form.Control
                  type="text"
                  value={form.contribuinte}
                  onChange={(e) => handleChange(e.target.value)}
                  placeholder="Digite o contribuinte (até 9 dígitos)"
                  maxLength={9}
                  isInvalid={!!errors.contribuinte}
                  className={styles.input}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.contribuinte}
                </Form.Control.Feedback>
                <Form.Text className={styles.helpText}>
                  O contribuinte é usado para identificar sua barbearia no sistema
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Row className="justify-content-center mt-4">
            <Col xs={12} sm={10} md={8} lg={6}>
              <div className="d-grid">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isChecking}
                  className={styles.submitButton}
                >
                  {isChecking ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Verificando...
                    </>
                  ) : (
                    'Continuar'
                  )}
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
};

export default ContribuinteCheck;
