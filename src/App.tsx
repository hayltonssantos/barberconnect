import React, { useState, useEffect, CSSProperties } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import RingLoader from 'react-spinners/RingLoader';
import { UserProvider } from './contexts/user';
import { ConfigProvider } from './contexts/ConfigContext';
import { StoreProvider } from './contexts/StoreContext';
import { DateProvider } from './contexts/DateContext';
import Login from './Pages/login/Login';
import Schedule from './Pages/schedule/Schedule';
import StorePage from './Pages/store/StorePage';
import ConfigurationPage from './Pages/configuration/ConfigurationPage';
import CreateSchedule from './Pages/create-schedule/CreateSchedule';
import ProtectedRoute from './components/protectedroute';
import ProtectedLayout from './components/ProtectedLayout';
import './style.scss';
import '../services/firebase';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const override: CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignSelf: "center",
    margin: "auto",
    borderColor: "red",
  };

  if (isLoading) {
    return (
      <div>
        <div className="titleContainer">
          <h1 className="title">Barber Connect</h1>
        </div>
        <div className="loader">
          <RingLoader 
            color="#8c3f0d" 
            loading={isLoading}
            cssOverride={override} 
            size={50} 
          />
        </div>
      </div>
    );
  }

  return (
    <DateProvider>
      <StoreProvider>
        <ConfigProvider>
          <UserProvider>
            <BrowserRouter>
              <Routes>
                {/* Rotas públicas */}
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Navigate to="/login" replace />} />
                
                {/* Abordagem 1: Usando ProtectedRoute como wrapper */}
                <Route 
                  path="/configuration" 
                  element={
                    <ProtectedRoute>
                      <ConfigurationPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Abordagem 2: Usando ProtectedLayout com Outlet */}
                <Route element={<ProtectedLayout requiresConfiguration={true} />}>
                  <Route path="/store" element={<StorePage />} />
                  <Route path="/schedule" element={<Schedule />} />
                  <Route path="/create-schedule" element={<CreateSchedule />} />
                </Route>

                {/* Rota para páginas não encontradas */}
                <Route 
                  path="*" 
                  element={
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                      <h2>Página não encontrada</h2>
                      <p>A página que você está procurando não existe.</p>
                    </div>
                  } 
                />
              </Routes>
            </BrowserRouter>
          </UserProvider>
        </ConfigProvider>
      </StoreProvider>
    </DateProvider>
  );
}

export default App;
