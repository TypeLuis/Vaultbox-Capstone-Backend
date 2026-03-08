import { createContext, useContext, useMemo } from "react";
import {useCookies} from 'react-cookie'
import type { FormData, AuthContextValue } from "../utilities/types/types";
import { authFunction } from "../utilities/functions/ApiFunctions";

export const AuthContext = createContext<AuthContextValue | null>(null)

export default function authProvider({children}: { children: React.ReactNode }){
    const [cookies, setCookies, removeCookies] = useCookies()

    const login = async (formdata:FormData) => authFunction(formdata, '/api/auth', setCookies)
    const signup = async (formdata:FormData) => authFunction(formdata, "/api/users", setCookies)
    const logout = () => removeCookies("token")

    // use memo, stores a value from computationally functions and will not rerun those functions as long as the value doesn't change
    // as long as cookies doesn't change, we don't need to rerun any of these functions
    const value = useMemo<AuthContextValue>(
        () => ({
            token: cookies.token,
            login,
            signup,
            logout,
        }),
        [cookies.token]
      );
    return( 
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth():AuthContextValue {
    const ctx = useContext(AuthContext)

    if (!ctx) {
      throw new Error("useAuth must be used inside <AuthProvider>")
    }
  
    return ctx
}