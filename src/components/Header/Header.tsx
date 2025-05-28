import React, { useContext, useState } from 'react';
import { useConfig } from '../../contexts/ConfigContext';
import { useStore } from '../../contexts/StoreContext';
import { UserContext } from '../../contexts/user';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import styles from './Header.module.scss';

export default function Header() {
  const { appName, barberShopConfig } = useConfig();
  const { 
    employees, 
    selectedEmployee, 
    setSelectedEmployee, 
    getActiveEmployees 
  } = useStore();
  const { user, signOut } : any = useContext(UserContext);
  const navigate = useNavigate();
  
  const [showUserMenu, setShowUserMenu] = useState(false);

  const activeEmployees = getActiveEmployees();
  const currentEmployee = selectedEmployee?.name || 'Todos os Funcionários';

  const handleEmployeeSelect = (employee: any) => {
    setSelectedEmployee(employee);
  };

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  const handleConfiguration = () => {
    navigate('/configuration');
  };

  const handleStore = () => {
    navigate('/store');
  };

  const handleCreateSchedule = () => {
    navigate('/create-schedule');
  };

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <div className={styles.titleContainer}>
          <h1 className={styles.appTitle}>{appName}</h1>
          {barberShopConfig?.nomeEstabelecimento && (
            <span className={styles.shopName}>{barberShopConfig.nomeEstabelecimento}</span>
          )}
        </div>
      </div>

      <nav className={styles.navigation}>
        <button 
          className={styles.navButton}
          onClick={handleStore}
        >
          Dashboard
        </button>
        <button 
          className={styles.navButton}
          onClick={handleCreateSchedule}
        >
          Nova Marcação
        </button>
      </nav>

      <div className={styles.rightSection}>
        {/* Dropdown de Funcionários */}
        <Dropdown className={styles.employeeDropdown}>
          <Dropdown.Toggle 
            variant="outline-light" 
            id="employee-dropdown"
            className={styles.employeeToggle}
          >
            <span className={styles.employeeIcon}>👤</span>
            <span className={styles.employeeText}>{currentEmployee}</span>
          </Dropdown.Toggle>
          
          <Dropdown.Menu className={styles.employeeMenu}>
            <Dropdown.Header className={styles.dropdownHeader}>
              Selecionar Funcionário
            </Dropdown.Header>
            
            {employees.map((employee: any) => (
              <Dropdown.Item
                key={employee.id}
                className={`${styles.employeeItem} ${
                  selectedEmployee?.id === employee.id ? styles.active : ''
                }`}
                onClick={() => handleEmployeeSelect(employee)}
              >
                <div className={styles.employeeInfo}>
                  <span className={styles.employeeName}>{employee.name}</span>
                  {employee.id !== 0 && employee.specialties && (
                    <span className={styles.employeeSpecialties}>
                      {employee.specialties.slice(0, 2).join(', ')}
                    </span>
                  )}
                </div>
                {selectedEmployee?.id === employee.id && (
                  <span className={styles.checkIcon}>✓</span>
                )}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>

        {/* Dropdown do Usuário */}
        <Dropdown 
          className={styles.userDropdown}
          show={showUserMenu}
          onToggle={(isOpen) => setShowUserMenu(isOpen)}
        >
          <Dropdown.Toggle 
            variant="outline-light" 
            id="user-dropdown"
            className={styles.userToggle}
          >
            <div className={styles.userAvatar}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className={styles.userName}>
              {user?.email?.split('@')[0] || 'Usuário'}
            </span>
          </Dropdown.Toggle>
          
          <Dropdown.Menu className={styles.userMenu} align="end">
            <Dropdown.Header className={styles.dropdownHeader}>
              <div className={styles.userInfo}>
                <div className={styles.userAvatarLarge}>
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className={styles.userDetails}>
                  <span className={styles.userEmail}>{user?.email}</span>
                  <span className={styles.userRole}>Administrador</span>
                </div>
              </div>
            </Dropdown.Header>
            
            <Dropdown.Divider />
            
            <Dropdown.Item 
              className={styles.menuItem}
              onClick={handleConfiguration}
            >
              <span className={styles.menuIcon}>⚙️</span>
              Configurações
            </Dropdown.Item>
            
            <Dropdown.Item 
              className={styles.menuItem}
              onClick={handleStore}
            >
              <span className={styles.menuIcon}>📊</span>
              Dashboard
            </Dropdown.Item>
            
            <Dropdown.Divider />
            
            <Dropdown.Item 
              className={`${styles.menuItem} ${styles.logoutItem}`}
              onClick={handleLogout}
            >
              <span className={styles.menuIcon}>🚪</span>
              Sair
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </header>
  );
}
