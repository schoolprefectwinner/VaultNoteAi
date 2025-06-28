import React, { useEffect } from 'react';
import { AuthContext, useAuthClient } from '../hooks/useAuth';
import { backendService } from '../services/backendService';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuthClient();
  
  // Initialize backend service when identity changes
  useEffect(() => {
    if (auth.identity && auth.isAuthenticated) {
      console.log('🔄 Initializing backend service with authenticated identity...');
      // Initialize backend service with authenticated identity
      backendService.initializeWithIdentity(auth.identity).then(() => {
        console.log('✅ Backend service ready for authenticated calls!');
      }).catch(error => {
        console.error('❌ Failed to initialize backend service with identity:', error);
      });
    }
  }, [auth.identity, auth.isAuthenticated]);
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

// Export useAuth from the hooks file to maintain consistency
export { useAuth } from '../hooks/useAuth';