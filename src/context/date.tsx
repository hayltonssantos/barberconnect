import dayjs from "dayjs";
import { createContext, useState } from "react";

const DateContext = createContext({})

const DateProvider = ({ children } : any) => {

    const currentDate = dayjs()
    const [today, setToday] = useState(currentDate)
    const [selectDate, setSelectDate] = useState(currentDate)

    return (
        <DateContext.Provider value={{ today, setToday, selectDate, setSelectDate, currentDate }}>
            {children}
        </DateContext.Provider>
    )
}
export { DateContext, DateProvider }