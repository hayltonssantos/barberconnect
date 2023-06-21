import{ createContext } from 'react'

const StoreContext = createContext({});

const StoreProvider = ({children} : any) =>{
  const storeName = 'Barber Shop Teste'

  return (
    <StoreContext.Provider value={{ storeName }}>
        {children}
    </StoreContext.Provider>
)
} 
export { StoreContext, StoreProvider }