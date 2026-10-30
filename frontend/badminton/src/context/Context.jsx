import { createContext } from "react"

const Context = createContext(null)

const ContextProvider = ({ children }) => {
    const name = "aadil"
    const value = {
        name
    }

    return <Context.Provider value={value}>
       {children}
    </Context.Provider>
}
export default ContextProvider;
