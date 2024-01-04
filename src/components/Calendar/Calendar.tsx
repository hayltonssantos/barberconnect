import React, {useState, useContext } from 'react'
import { generateDate, months } from '../../util/calendar.tsx'
import cn from '../../util/cn.tsx';
import {GrFormNext, GrFormPrevious} from 'react-icons/gr'
import styles from './Calendar.module.scss'
import { DateContext } from '../../context/date.tsx';
import { Table } from 'react-bootstrap';
import { StoreContext } from '../../context/store.tsx';

export default function Calendar({onOffSchedule = false, onOffCalendar = true}) {

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  const {today, setToday, selectDate, setSelectDate, currentDate} : any = useContext(DateContext)
  const {activeEmployee} : any = useContext(StoreContext) 

  const marcacoes = [
    { 'func': 'User 1',
      'name': 'Matheus',
      'tel': '987657848',
      'time': '09:30 - 10:00',
      'date' : '2023/06/22'    
    },
    { 'func': 'User 1',
      'name': 'Pedro',
      'tel': '987657848',
      'time': '09:30 - 10:00',
      'date' : '2023/06/23'   
    },
    { 'func': 'User 2',
      'name': 'Paulo',
      'tel': '987657848',
      'time': '09:30 - 10:00',
      'date' : '2023/06/22'    
    },
    { 'func': 'User 2',
      'name': 'Carlos',
      'tel': '987657848',
      'time': '09:30 - 10:00',
      'date' : '2023/06/23'   
    },
    { 'func': 'User 1',
    'name': 'Matheus',
    'tel': '987657848',
    'time': '09:30 - 10:00',
    'date' : '2023/06/22'    
    },
    { 'func': 'User 1',
      'name': 'Pedro',
      'tel': '987657848',
      'time': '09:30 - 10:00',
      'date' : '2023/06/23'   
    },
    { 'func': 'User 2',
      'name': 'Paulo',
      'tel': '987657848',
      'time': '09:30 - 10:00',
      'date' : '2023/06/22'    
    },
    { 'func': 'User 2',
      'name': 'Carlos',
      'tel': '987657848',
      'time': '09:30 - 10:00',
      'date' : '2023/06/23'   
    },
    { 'func': 'User 1',
    'name': 'Matheus',
    'tel': '987657848',
    'time': '09:30 - 10:00',
    'date' : '2023/06/22'    
    },
    { 'func': 'User 1',
      'name': 'Pedro',
      'tel': '987657848',
      'time': '09:30 - 10:00',
      'date' : '2023/06/23'   
    },
    { 'func': 'User 2',
      'name': 'Paulo',
      'tel': '987657848',
      'time': '09:30 - 10:00',
      'date' : '2023/06/22'    
    },
    { 'func': 'User 2',
      'name': 'Carlos',
      'tel': '987657848',
      'time': '09:30 - 10:00',
      'date' : '2023/06/23'   
    },
  ]

  const noMeeting = () => { 
    const element = document.getElementById('marcacao')
    const exist = document.body.contains(element)
    if (exist === true) {
      return ('')
     }else{
      return (        
        <tr id='marcacao' className={styles.marcacaodiv}>
          <td colSpan={12}>
            No more meetings for today
          </td>
        </tr>
      )
    }
  }

  const schedule = (onOffSchedule : any) => {
    if (onOffSchedule === true){
    return (
      <>
      <div className={styles.schedule}>
        <div className={styles.titleSchedule}>
          <h1
            > 
            Schedule for {selectDate.toDate().toDateString()}
          </h1>
        </div>
          <Table striped hover>
            <thead>
                <tr>
                  <th>Funcionário</th>
                  <th>Cliente</th>
                  <th>Telefone</th>
                  <th>Horario</th>
                </tr>
              </thead>
              <tbody>
                {marcacoes.map((marcado)=>{
                  const dateMarcado = new Date(marcado.date)
                  const aux = []
                  if (activeEmployee === 'All'){
                    if(dateMarcado.toDateString() === selectDate.toDate().toDateString()){
                      aux.push(
                        <tr id='marcacao' className={styles.marcacaodiv}>
                          <td>{marcado.func}</td>
                          <td>{marcado.name}</td>
                          <td>{marcado.tel}</td>
                          <td>{marcado.time}</td>
                        </tr>
                      )
                    }
                  }else{
                    if(dateMarcado.toDateString() === selectDate.toDate().toDateString() && (marcado.func === activeEmployee )){
                      aux.push(
                        <tr id='marcacao' className={styles.marcacaodiv}>
                          <td>{marcado.func}</td>
                          <td>{marcado.name}</td>
                          <td>{marcado.tel}</td>
                          <td>{marcado.time}</td>
                        </tr>
                      )
                    }
                  }  
                  return aux
                })}
                {noMeeting()}   
              </tbody>
          </Table>
        </div>
      </>
    )}
  }

  const calendar = (onOffCalendar : any) => {
    if (onOffCalendar === true){
      return(
        <div className={styles.calendar}>
          <div className={styles.header}>
            <h1 className={styles.title}>
              {months[today.month()]}, {today.year()}
            </h1>
            <div className={styles.nextPrevious}>
              <GrFormPrevious
                className={styles.next}
                onClick={() =>{
                  setToday(today.month(today.month() - 1))
                }}
              />
              <h1 className={styles.todayHeader} onClick={() =>{
                  setSelectDate(currentDate)
                  setToday(currentDate)
                }}
              >Today</h1>
              <GrFormNext className={styles.previous}
              onClick={() =>{
                setToday(today.month(today.month() + 1))
              }}/>
            </div>
          </div>
          <div className={styles.days}>
            {days.map((day, index)=>{
              return <h1 key={index} 
              className={styles.day}>
                {day}
                </h1>
            })}
          </div>

        <div className={styles.boxDate}>
          
          {generateDate(today.month(),today.year()).map(({date, currentMonth, today})=>{
            
            return( 
              <div className={styles.date}>
                <h1 className={cn(
                  currentMonth ? "" : `${styles.current}`,
                  
                  today?`${styles.today}`:"",

                  String(selectDate
                    .toDate()
                    .toDateString) === 
                    
                    String(date.toDate()
                      .toDateString()) 
                      ? `${styles.selectDate}`
                      : "",

                  `${styles.tableDate}`
                  )}
                  onClick={() => {
                    setSelectDate(date)
                  }}
                  >
                    {date.date()}
                </h1>
              </div>
              )
              
          })}
        </div>
      </div>
      )
    }
  }
  
  return (
    <div className={styles.background}>
        {calendar(onOffCalendar)}

      <div className={styles.backSchedule}>
        {schedule(onOffSchedule)}
      </div>
      
    </div>
  )
}
