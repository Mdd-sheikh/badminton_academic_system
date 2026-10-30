import { createContext } from "react"

const Context = createContext(null)

const ContextProvider = ({ children }) => {
    const user = JSON.parse(localStorage.getItem("user"))
    const value = {
        name
    }

    return <Context.Provider value={value}>
       {children}
    </Context.Provider>
}
export default ContextProvider;
