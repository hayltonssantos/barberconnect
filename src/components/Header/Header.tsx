import {useContext, useMemo, useState} from 'react'
import { ConfigContext } from '../../context/config'
import styles from './Header.module.scss'
import { Button, Dropdown } from 'react-bootstrap'
import DropdownMenu from 'react-bootstrap/esm/DropdownMenu'
import DropdownItem from 'react-bootstrap/esm/DropdownItem'
import DropdownToggle from 'react-bootstrap/esm/DropdownToggle'

export default function Header(){
    const {appName} : any = useContext(ConfigContext)

    const [Users] = useState([{
            'id' : 1,
            'name': 'User 1'
        },
        {
            'id': 2,
            'name': 'User 2'
        },
        {   
            'id': 3,
            'name': 'User 3'
        }    
    ])

    const firstUser = () =>{
        const user = Users.map((user) => {if(user.id === 1){return user.name} else {return ''}})
        return user
    }
    const [selectUser, setSelectUser] = useState(firstUser())
    const activeUser = useMemo(() => (selectUser),[selectUser])
    
    return(
        <header className={`${styles.header} align-items-center`}>
            <div className={styles.divTitle}>
                <span className={`${styles.title}`}>{appName}</span>
            </div>
           
            <Dropdown className={styles.user}>
                <DropdownToggle variant='success' id='dropdown-basic' className={styles.dropdown}>
                    {activeUser}
                </DropdownToggle>
                    <DropdownMenu>
                        {Users.map((user:any) => (
                            <DropdownItem>
                                <Button className={styles.dropdownItens} onClick={() => setSelectUser(user.name)}>
                                    {user.name}
                                </Button>    
                            </DropdownItem>
                        ))}
                    </DropdownMenu>
            </Dropdown>       
        
        </header>
    )
}