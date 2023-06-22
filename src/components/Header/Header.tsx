import {useContext, useMemo, useState} from 'react'
import { ConfigContext } from '../../context/config'
import styles from './Header.module.scss'
import { Button, Dropdown } from 'react-bootstrap'
import DropdownMenu from 'react-bootstrap/esm/DropdownMenu'
import DropdownItem from 'react-bootstrap/esm/DropdownItem'
import DropdownToggle from 'react-bootstrap/esm/DropdownToggle'
import { StoreContext } from '../../context/store'

export default function Header(){
    const {appName} : any = useContext(ConfigContext)
    const {Employees, setSelectEmployee, activeEmployee} : any = useContext(StoreContext)
    return(
        <header className={`${styles.header} align-items-center`}>
            <div className={styles.divTitle}>
                <span className={`${styles.title}`}>{appName}</span>
            </div>
           
            <Dropdown className={styles.user}>
                <DropdownToggle variant='success' id='dropdown-basic' className={styles.dropdown}>
                    {activeEmployee}
                </DropdownToggle>
                    <DropdownMenu>
                        {Employees.map((user:any) => (
                            <DropdownItem>
                                <Button className={styles.dropdownItens} onClick={() => setSelectEmployee(user.name)}>
                                    {user.name}
                                </Button>    
                            </DropdownItem>
                        ))}
                    </DropdownMenu>
            </Dropdown>       
        
        </header>
    )
}