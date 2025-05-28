// src/components/ProtectedRoute.tsx
import React, { ReactNode, useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserContext } from '../contexts/user';
import { useConfig } from '../contexts/ConfigContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiresConfiguration?: boolean;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiresConfiguration = false,
  redirectTo = '/login' 
}) => {
  const { user, loading } = useContext(UserContext);
  const { isConfigured } = useConfig();
  const location = useLocation();

  // Mostra loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="loader">
        <div>Verificando autenticação...</div>
      </div>
    );
  }

  // Redireciona para login se não estiver autenticado
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Verifica se requer configuração e redireciona se necessário
  if (requiresConfiguration && !isConfigured) {
    return <Navigate to="/configuration" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
