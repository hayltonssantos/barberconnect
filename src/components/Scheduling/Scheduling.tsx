import React from 'react'
import styles from './Scheduling.module.scss'

export default function Scheduling({children} : any) {
  return (
    <aside className={styles.menuAside}>
      <div className={styles.backScheduling}>
          <div className={styles.scheduling}>
            {children}
          </div>
      </div>
    </aside>
  )
}