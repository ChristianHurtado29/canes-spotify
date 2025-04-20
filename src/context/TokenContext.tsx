import React, { createContext, useContext, useState, useEffect } from 'react';

interface TokenContextType {
  accessToken: string;
  isLoading: boolean;
  setAccessToken: (token: string) => void;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export const TokenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        const response = await fetch('/api/refresh-token');
        const data = await response.json();
        console.log('data', data);
        setAccessToken(data.access_token);
      } catch (error) {
        console.error('Error fetching access token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccessToken();

    // Refresh token every 55 minutes
    const interval = setInterval(fetchAccessToken, 55 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <TokenContext.Provider value={{ accessToken, isLoading, setAccessToken }}>
      {children}
    </TokenContext.Provider>
  );
};

export const useToken = () => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error('useToken must be used within a TokenProvider');
  }
  return context;
};
