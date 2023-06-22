import{ createContext, useMemo, useState } from 'react'

const StoreContext = createContext({});

const StoreProvider = ({children} : any) =>{
  const storeName = 'Barber Shop Teste'

  const [Employees] = useState([
  {
    'id': 0,
    'name': 'All'
  },
  {
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

  const firstEmployee = () =>{
    const user = Employees.map((user) => {if(user.id === 0){return user.name} else {return ''}})
      return user
  }
  const [selectEmployee, setSelectEmployee] = useState(firstEmployee())
  const activeEmployee = useMemo(() => (selectEmployee),[selectEmployee])


  return (
    <StoreContext.Provider value={{ storeName, Employees, selectEmployee, setSelectEmployee, activeEmployee }}>
        {children}
    </StoreContext.Provider>
)
} 
export { StoreContext, StoreProvider }