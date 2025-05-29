// src/components/ui/Loading/Loading.tsx
import React from 'react';
import { Spinner } from 'react-bootstrap';
import styles from './Loading.module.scss';

interface LoadingProps {
  message?: string;
  size?: 'sm' | 'lg';
  variant?: 'primary' | 'secondary' | 'light';
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ 
  message = 'Carregando...', 
  size = 'lg',
  variant = 'primary',
  fullScreen = true 
}) => {
  const containerClass = fullScreen ? styles.fullScreen : styles.inline;

  return (
    <div className={containerClass}>
      <div className={styles.content}>
        <div className={styles.spinnerContainer}>
          <Spinner 
            animation="border" 
            size={size}
            variant={variant}
            className={styles.spinner}
          />
        </div>
        
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>Barber Connect</h1>
        </div>
        
        {message && (
          <p className={styles.message}>{message}</p>
        )}
      </div>
    </div>
  );
};

export default Loading;
