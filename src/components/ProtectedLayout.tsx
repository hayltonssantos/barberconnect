// src/components/ProtectedLayout.tsx
import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { UserContext } from '../contexts/user';
import { useConfig } from '../contexts/ConfigContext';

interface ProtectedLayoutProps {
  requiresConfiguration?: boolean;
}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ 
  requiresConfiguration = false 
}) => {
  const { user, loading } : any = useContext(UserContext);
  const { isConfigured } = useConfig();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loader">
        <div>Verificando autenticação...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiresConfiguration && !isConfigured) {
    return <Navigate to="/configuration" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedLayout;
