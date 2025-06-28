import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

interface AuthContextType {
  isAuthenticated: boolean;
  identity: Identity | null;
  principal: Principal | null;
  authClient: AuthClient | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthClient = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [principal, setPrincipal] = useState<Principal | null>(null);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [loading, setLoading] = useState(true);

  // Environment-specific Internet Identity URL
  const getIdentityProvider = () => {
    // Always use the live Internet Identity service for better reliability
    // This works for both local development and production
    return 'https://identity.ic0.app';
    
    // Alternative: If you specifically want to use local Internet Identity for testing
    // const network = import.meta.env.VITE_DFX_NETWORK || (import.meta.env.VITE_NODE_ENV === 'production' ? 'ic' : 'local');
    // if (network === 'ic') {
    //   return 'https://identity.ic0.app'; // Mainnet
    // } else {
    //   return 'http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943'; // Local
    // }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    try {
      setLoading(true);
      
      // Create AuthClient instance
      const client = await AuthClient.create({
        idleOptions: {
          idleTimeout: 1000 * 60 * 30, // 30 minutes
          disableDefaultIdleCallback: true, // We'll handle idle state ourselves
        },
      });
      
      setAuthClient(client);

      // Check if user is already authenticated
      const isAuth = await client.isAuthenticated();
      setIsAuthenticated(isAuth);

      if (isAuth) {
        const identity = client.getIdentity();
        const principal = identity.getPrincipal();
        
        setIdentity(identity);
        setPrincipal(principal);
        
        console.log('🔄 Existing session found!');
        console.log('👤 Principal ID:', principal.toString());
        console.log('🔐 Identity restored:', identity);
      } else {
        console.log('🔓 No existing authentication session found');
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    if (!authClient) {
      console.error('AuthClient not initialized');
      return;
    }

    try {
      setLoading(true);
      
      const identityProvider = getIdentityProvider();
      
      console.log('🚀 Starting Internet Identity login with provider:', identityProvider);
      
      // Start the login process
      await new Promise<void>((resolve, reject) => {
        authClient.login({
          identityProvider,
          // Maximum time to live for the delegation (7 days)
          maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000),
          onSuccess: () => {
            console.log('✅ Internet Identity login successful!');
            resolve();
          },
          onError: (error) => {
            console.error('❌ Internet Identity login failed:', error);
            reject(error);
          },
        });
      });

      // Get the identity after successful login
      const identity = authClient.getIdentity();
      const principal = identity.getPrincipal();
      
      setIsAuthenticated(true);
      setIdentity(identity);
      setPrincipal(principal);
      
      console.log('🎉 Successfully authenticated!');
      console.log('👤 Principal ID:', principal.toString());
      console.log('🔐 Identity:', identity);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!authClient) {
      console.error('AuthClient not initialized');
      return;
    }

    try {
      setLoading(true);
      
      await authClient.logout();
      
      setIsAuthenticated(false);
      setIdentity(null);
      setPrincipal(null);
      
      console.log('👋 Successfully logged out from Internet Identity');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    isAuthenticated,
    identity,
    principal,
    authClient,
    login,
    logout,
    loading
  };
};