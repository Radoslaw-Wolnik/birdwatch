import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from './SupabaseContext';

const AuthCheck = ({ children }) => {
  const { user } = useAuth();
  const history = useHistory();

  useEffect(() => {
    if (!user) {
      history.push('/login');
    }
  }, [user, history]);

  return user ? children : null;
};

export default AuthCheck;