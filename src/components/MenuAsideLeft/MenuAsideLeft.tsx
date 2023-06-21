import styles from './MenuAsideLeft.module.scss'
import photo1 from '../../assets/photos/barbershop.png'
import { useContext } from 'react'
import { StoreContext } from '../../context/store'

export default function MenuAsideLeft({children}:any) {
  const {storeName} : any = useContext(StoreContext)
  return (
    <aside className={styles.menuAside}>
        <div className={styles.divIcon}>
            <img src={photo1} className={styles.icon}></img>
          <h3 className={styles.storeName}>{storeName}</h3>
        {children}
        </div>
    </aside>
  )
}
