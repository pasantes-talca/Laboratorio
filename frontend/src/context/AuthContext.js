import { createContext, useContext } from 'react';
export const AuthContext = createContext({ user: null });
export const useSession = () => useContext(AuthContext);
