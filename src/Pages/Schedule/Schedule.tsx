import Header from '../../components/ui/Header/Header'
import Scheduling from '../../components/Scheduling/Scheduling'
import MenuAsideLeft from '../../components/ui/MenuAsideLeft/MenuAsideLeft'
import MenuAsideRight from '../../components/ui/MenuAsideRight/MenuAsideRight'
import Calendar from '../../components/ui/Calendar/Calendar'

export default function Schedule(){
    return (
        <div>
            <Header/>
            <section style={{
                display: 'flex'
            }}>
                <MenuAsideLeft/>
                <Scheduling>
                    <Calendar showSchedule={true} showCalendar={false}/>
                </Scheduling>
                <MenuAsideRight>
                    <Calendar showSchedule={false} showCalendar={true}/>
                </MenuAsideRight>
            </section>
        </div>
    )
}
