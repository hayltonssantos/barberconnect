import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Login from './Pages/Login/Login'
import { UserProvider }from './context/user.tsx'
import './style.scss'
import RingLoader from 'react-spinners/RingLoader'
import { useState, useEffect, CSSProperties } from 'react'
import '../services/firebase'
import Schedule from './Pages/Schedule/Schedule.tsx'
import { ConfigProvider } from './context/config.tsx'
import { StoreProvider } from './context/store.tsx'
import { DateProvider } from './context/date.tsx'

function App() {

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false)
    }, 3000)
  }, [])

  const override: CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignSelf: "center",
    margin: "auto",
    borderColor: "red",
  };

  return isLoading ?(
      <>
      <div>
        {
          <>
          <div className={"titleContainer"}>
            <h1 className={"title"}>Barber Connect</h1>
          </div>  
          <div className={"loader"}>
            <RingLoader 
              color={'#8c3f0d'} 
              loading={isLoading}
              cssOverride={override} 
              size={50} 
              />
          </div>
          </>
        }
      </div>
      </> 
    ) :  (
    <DateProvider>
      <StoreProvider>
        <ConfigProvider>
          <UserProvider>
            <BrowserRouter>
              <Routes>
                <Route path='login' element={<Login/>} />
                <Route path='/' element={<Navigate to={'/login'}/>} />
                
                <Route path='schedule' element={<Schedule/>} />
              </Routes>
            </BrowserRouter>
          </UserProvider>
        </ConfigProvider>
      </StoreProvider>
    </DateProvider>
    
  )
}

export default App
