// src/App.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from '@/contexts/UserContext';
import { ConfigProvider } from '@/contexts/ConfigContext';
import { StoreProvider } from '@/contexts/StoreContext';
import { DateProvider } from '@/contexts/DateContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute/ProtectedRoute';
import ContribuinteCheck from '@/components/auth/ContribuinteCheck/ContribuinteCheck';
import Login from '@/pages/Login/Login';
import ConfigurationPage from '@/pages/Configuration/ConfigurationPage';
import StorePage from '@/pages/Store/StorePage';
import Loading from '@/components/ui/Loading/Loading';
import { ErrorBoundary } from 'react-error-boundary';
import './App.scss';
import CreateSchedule from './Pages/CreateSchedule/CreateSchedule';
import FuncionariosPage from './Pages/Funcionarios/FuncionariosPage';

// Componente de erro
const ErrorFallback: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({ 
  error, 
  resetErrorBoundary 
}) => (
  <div className="error-fallback">
    <div className="error-content">
      <h1>Oops! Algo deu errado</h1>
      <p>Ocorreu um erro inesperado na aplicação:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary} className="retry-button">
        Tentar novamente
      </button>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Erro capturado pelo ErrorBoundary:', error, errorInfo);
      }}
    >
      <DateProvider>
        <UserProvider>
          <ConfigProvider>
            <StoreProvider>
              <BrowserRouter>
                <div className="app">
                  <Routes>
                    {/* Rota inicial - verificação de contribuinte */}
                    <Route path="/" element={<ContribuinteCheck />} />
                    
                    {/* Rota de login */}
                    <Route path="/login" element={<Login />} />
                    
                    {/* Rota de configuração - protegida por autenticação */}
                    <Route 
                      path="/configuration" 
                      element={
                        <ProtectedRoute>
                          <ConfigurationPage />
                        </ProtectedRoute>
                      } 
                    />

                    <Route 
                      path="/create-schedule" 
                      element={
                        <ProtectedRoute requiresConfiguration={true}>
                          <CreateSchedule />
                        </ProtectedRoute>
                      } 
                    />

                    <Route 
                      path="/funcionarios" 
                      element={
                        <ProtectedRoute requiresConfiguration={true}>
                          <FuncionariosPage />
                        </ProtectedRoute>
                      } 
/>
                    
                    {/* Rotas protegidas que precisam de configuração */}
                    <Route 
                      path="/store" 
                      element={
                        <ProtectedRoute requiresConfiguration={true}>
                          <StorePage />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Rota para criar agendamento */}
                    <Route 
                      path="/create-schedule" 
                      element={
                        <ProtectedRoute requiresConfiguration={true}>
                          <div style={{ padding: '2rem', textAlign: 'center' }}>
                            <h2>Página de Criar Agendamento</h2>
                            <p>Em desenvolvimento...</p>
                          </div>
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Rota para agendamentos */}
                    <Route 
                      path="/schedule" 
                      element={
                        <ProtectedRoute requiresConfiguration={true}>
                          <div style={{ padding: '2rem', textAlign: 'center' }}>
                            <h2>Página de Agendamentos</h2>
                            <p>Em desenvolvimento...</p>
                          </div>
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Rota para relatórios */}
                    <Route 
                      path="/reports" 
                      element={
                        <ProtectedRoute requiresConfiguration={true}>
                          <div style={{ padding: '2rem', textAlign: 'center' }}>
                            <h2>Página de Relatórios</h2>
                            <p>Em desenvolvimento...</p>
                          </div>
                        </ProtectedRoute>
                      } 
                    />

                    {/* Rota 404 */}
                    <Route 
                      path="*" 
                      element={
                        <div className="not-found">
                          <div className="not-found-content">
                            <h1>404</h1>
                            <h2>Página não encontrada</h2>
                            <p>A página que você está procurando não existe.</p>
                            <button onClick={() => window.location.href = '/'}>
                              Voltar ao início
                            </button>
                          </div>
                        </div>
                      } 
                    />
                  </Routes>
                </div>
              </BrowserRouter>
            </StoreProvider>
          </ConfigProvider>
        </UserProvider>
      </DateProvider>
    </ErrorBoundary>
  );
};

export default App;
