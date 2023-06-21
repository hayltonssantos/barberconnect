import { createContext } from "react";

const ConfigContext = createContext({})

const ConfigProvider = ({ children } : any) => {

    const appName = 'Barber Connect'

    return (
        <ConfigContext.Provider value={{ appName }}>
            {children}
        </ConfigContext.Provider>
    )
}
export { ConfigContext, ConfigProvider }