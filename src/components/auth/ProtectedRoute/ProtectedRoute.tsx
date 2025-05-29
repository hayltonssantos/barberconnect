// src/components/auth/ProtectedRoute/ProtectedRoute.tsx
import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/UserContext';
import { useConfig } from '@/contexts/ConfigContext';
import Loading from '@/components/ui/Loading/Loading';

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
  const { user, loading: authLoading } = useAuth();
  const { isConfigured, loading: configLoading } = useConfig();
  const location = useLocation();

  // Mostrar loading enquanto verifica autenticação
  if (authLoading || configLoading) {
    return <Loading message="Verificando autenticação..." />;
  }

  // Redirecionar para login se não estiver autenticado
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Verificar se requer configuração e redirecionar se necessário
  if (requiresConfiguration && !isConfigured) {
    return <Navigate to="/configuration" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
