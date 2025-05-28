import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { useStore } from '../../contexts/StoreContext';
import { useConfig } from '../../contexts/ConfigContext';
import { UserContext } from '../../contexts/user';
import { BiLogOut } from 'react-icons/bi';
import { BsPeopleFill, BsFillGearFill } from 'react-icons/bs';
import { AiFillHome } from 'react-icons/ai';
import { FaMoneyBill, FaCalendarPlus, FaChartBar } from 'react-icons/fa';
import photo1 from '../../assets/photos/barbershop.png';
import styles from './MenuAsideLeft.module.scss';

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  isActive: boolean;
  onClick: () => void;
  variant?: 'primary' | 'danger';
}

const MenuItem: React.FC<MenuItemProps> = ({ 
  icon, 
  label, 
  path, 
  isActive, 
  onClick, 
  variant = 'primary' 
}) => (
  <Button 
    className={`${styles.menuButton} ${isActive ? styles.active : ''} ${variant === 'danger' ? styles.danger : ''}`}
    onClick={onClick}
    variant="outline-light"
  >
    <span className={styles.icon}>{icon}</span>
    <span className={styles.label}>{label}</span>
  </Button>
);

export default function MenuAsideLeft() {
  const { storeName } = useStore();
  const { barberShopConfig } = useConfig();
  const { signOut, user } : any = React.useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  const menuItems = [
    {
      icon: <AiFillHome />,
      label: 'Dashboard',
      path: '/store',
      onClick: () => navigate('/store')
    },
    {
      icon: <FaCalendarPlus />,
      label: 'Nova Marcação',
      path: '/create-schedule',
      onClick: () => navigate('/create-schedule')
    },
    {
      icon: <FaChartBar />,
      label: 'Relatórios',
      path: '/reports',
      onClick: () => navigate('/reports')
    },
    {
      icon: <BsPeopleFill />,
      label: 'Funcionários',
      path: '/employees',
      onClick: () => navigate('/employees')
    },
    {
      icon: <FaMoneyBill />,
      label: 'Financeiro',
      path: '/finance',
      onClick: () => navigate('/finance')
    },
    {
      icon: <BsFillGearFill />,
      label: 'Configurações',
      path: '/configuration',
      onClick: () => navigate('/configuration')
    }
  ];

  const displayName = barberShopConfig?.nomeEstabelecimento || storeName;

  return (
    <aside className={styles.menuAside}>
      <div className={styles.header}>
        <div className={styles.logoContainer}>
          <img src={photo1} className={styles.logo} alt="Logo da Barbearia" />
        </div>
        <div className={styles.storeInfo}>
          <h3 className={styles.storeName}>{displayName}</h3>
          {barberShopConfig?.endereco && (
            <p className={styles.storeAddress}>{barberShopConfig.endereco}</p>
          )}
        </div>
      </div>

      <nav className={styles.navigation}>
        <div className={styles.menuSection}>
          <h4 className={styles.sectionTitle}>Menu Principal</h4>
          <div className={styles.menuItems}>
            {menuItems.map((item) => (
              <MenuItem
                key={item.path}
                icon={item.icon}
                label={item.label}
                path={item.path}
                isActive={location.pathname === item.path}
                onClick={item.onClick}
              />
            ))}
          </div>
        </div>
      </nav>

      <div className={styles.footer}>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className={styles.userDetails}>
            <span className={styles.userName}>
              {user?.email?.split('@')[0] || 'Usuário'}
            </span>
            <span className={styles.userRole}>Administrador</span>
          </div>
        </div>
        
        <MenuItem
          icon={<BiLogOut />}
          label="Sair"
          path="/logout"
          isActive={false}
          onClick={handleLogout}
          variant="danger"
        />
      </div>
    </aside>
  );
}
