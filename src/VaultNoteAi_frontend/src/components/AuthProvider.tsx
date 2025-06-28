import React from 'react';
import { AuthContext, useAuthClient } from '../hooks/useAuth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuthClient();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

// Export useAuth from the hooks file to maintain consistency
export { useAuth } from '../hooks/useAuth';