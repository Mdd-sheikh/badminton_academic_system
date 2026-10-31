import { createContext } from "react"

export const Context = createContext(null)

const ContextProvider = ({ children }) => {
    const users = [
        { name: "aadil", role: "coach", password: "aadil", email: "aadil@example.com" },
        { name: "sahil", role: "parent", password: "sahil", email: "sahil@example.com" },
        { name: "shubham", role: "player", password: "shubham", email: "shubham@example.com" },
        {name:"sheikh",role:"admin",password:"admin",email:"admin@example.com"}
    ]

    const value = {
        users

    }

    return <Context.Provider value={value}>
        {children}
    </Context.Provider>
}
export default ContextProvider;
