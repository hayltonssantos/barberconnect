import React, {useState, useContext } from 'react'
import { generateDate, months } from '../../util/calendar.tsx'
import cn from '../../util/cn.tsx';
import dayjs from 'dayjs';
import {GrFormNext, GrFormPrevious} from 'react-icons/gr'
import styles from './Calendar.module.scss'
import { DateContext } from '../../context/date.tsx';
import { Table } from 'react-bootstrap';

export default function Calendar({onOffSchedule = false, onOffCalendar = true}) {

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  const {today, setToday, selectDate, setSelectDate, currentDate} : any = useContext(DateContext)
/*   const currentDate = dayjs()
  const [today, setToday] = useState(currentDate)

  const [selectDate, setSelectDate] = useState(currentDate)
 */
  const marcacoes = [
    {'name': 'Matheus Silva',
      'tel': '987657848',
      'time': '09:30 - 10:00',
      'date' : '2023/06/20'    
    },
    {'name': 'Pedro Silva',
      'tel': '987657848',
      'time': '09:30 - 10:00',
      'date' : '2023/06/21'   
    },
    {'name': 'Paulo Silva',
      'tel': '987657848',
      'time': '09:30 - 10:00',
      'date' : '2023/06/20'    
    },
    {'name': 'Carlos Silva',
      'tel': '987657848',
      'time': '09:30 - 10:00',
      'date' : '2023/06/21'   
    },
    {'name': 'Tiago Silva',
      'tel': '987657848',
      'time': '09:30 - 10:00',
      'date' : '2023/06/20'    
    },
    {'name': 'Fernando Silva',
      'tel': '987657848',
      'time': '09:30 - 10:00',
      'date' : '2023/06/21'   
    },
    {'name': 'Fernando Silva',
      'tel': '987657848',
      'time': '09:30 - 10:00',
      'date' : '2023/06/21'   
    },
    {'name': 'Fernando Silva',
      'tel': '987657848',
      'time': '09:30 - 10:00',
      'date' : '2023/06/21'   
    },
    {'name': 'Fernando Silva',
      'tel': '987657848',
      'time': '09:30 - 10:00',
      'date' : '2023/06/21'   
    },

  ]

  const noMeeting = () => { 
    const element = document.getElementById('marcacao')
    const exist = document.body.contains(element)
    if (exist === true) {
      return ('')
     }else{
      return (
        <tbody>
          <tr>
              <td >
                No more meetings for today
              </td>
            </tr>
        </tbody>
      )
    }
  }

  const schedule = (onOffSchedule : any) => {
    if (onOffSchedule === true){
    return (
      <div className={styles.schedule}>
        <h1
           className={styles.titleSchedule}> 
           Schedule for {selectDate.toDate().toDateString()}
        </h1>
        <Table >
          <thead>
              <tr>
                <th>Funcionário</th>
                <th>Cliente</th>
                <th>Telfone</th>
                <th>Horario</th>
              </tr>
            </thead>
            <tbody>
              {marcacoes.map((marcado)=>{
                const dateMarcado = new Date(marcado.date)
                const aux = []
                if(dateMarcado.toDateString() === selectDate.toDate().toDateString()){
                  aux.push(
                    <tr id='marcacao' className={styles.marcacaodiv}>
                      <td>{marcado.name}</td>
                      <td>{marcado.name}</td>
                      <td>{marcado.tel}</td>
                      <td>{marcado.time}</td>
                      {/* <div className={styles.card}>
                        
                        <p>Nome: {marcado.name}</p>
                        <p>Tel: {marcado.tel}</p>
                        <p>{marcado.time}</p>
                        
                      </div> */}
                      {/* <p className={styles.pName}>Nome: {marcado.name}</p>
                      <p>Tel: {marcado.tel}</p>
                    <p>{marcado.time}</p> */}
                    </tr>
                  )
                }
                return aux
              })}
            </tbody>
        {noMeeting()} 
        </Table>
      </div>
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
            <GrFormPrevious className={styles.next}
              onClick={() =>{
                setToday(today.month(today.month() - 1))
              }}
            />
            <h1 onClick={() =>{
                setSelectDate(currentDate)
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
          
          {generateDate(today.month(),today.year()).map(({date, currentMonth, today},index)=>{
            
            return( 
              <div className={styles.date}>
                <h1 className={cn(
                  currentMonth ? "" : `${styles.current}`,
                  
                  today?~`${styles.today}`:"",

                  String(selectDate
                    .toDate()
                    .toDateString) === 
                    date.toDate()
                      .toDateString() 
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
      {schedule(onOffSchedule)}
    </div>
  )
}
