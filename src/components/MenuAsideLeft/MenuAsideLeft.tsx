import styles from './MenuAsideLeft.module.scss'
import photo1 from '../../assets/photos/barbershop.png'
import { useContext } from 'react'
import { StoreContext } from '../../context/store'
import { Button } from 'react-bootstrap'
import { UserContext } from '../../context/user'
import { BiLogOut } from 'react-icons/bi'
import { BsPeopleFill, BsFillGearFill } from 'react-icons/bs'
import { AiFillHome } from 'react-icons/ai'  
import { FaMoneyBill } from 'react-icons/fa'  

export default function MenuAsideLeft() {
  const {storeName} : any = useContext(StoreContext)
  const {signOut} : any = useContext(UserContext)
  return (
    <aside className={styles.menuAside}>
        <div className={styles.divIcon}>
            <img src={photo1} className={styles.icon}></img>
          <h3 className={styles.storeName}>{storeName}</h3>
        </div>
        <div className={styles.divButtons}>
          <Button className={`bg-white border-0 ${styles.buttons}`}>
            <AiFillHome/>
            Home
          </Button>
          <Button className={`bg-white border-0 ${styles.buttons}`}>
            <FaMoneyBill/>
              Finance
          </Button>
          <Button className={`bg-white border-0 ${styles.buttons}`}>
            <BsPeopleFill/>
            Worker
          </Button>
          <Button className={`bg-white border-0 ${styles.buttons}`}>
            <BsFillGearFill/>
            Config
          </Button>
          <Button className={`bg-danger border-0 ${styles.buttons}`}  onClick={() => signOut()}>
            <BiLogOut/>
            Logout
          </Button>
        </div>
    </aside>
  )
}
