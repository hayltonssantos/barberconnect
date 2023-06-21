import styles from './MenuAsideRight.module.scss'
import { useContext } from 'react'
import { StoreContext } from '../../context/store'

export default function MenuAsideRight({children}:any) {
  const {storeName} : any = useContext(StoreContext)
  return (
    <aside className={styles.menuAside}>
        <div className={styles.divIcon}>
        {children}
        </div>
    </aside>
  )
}
