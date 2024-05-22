import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

// Update this with the provided endpoint and region
const supabaseOptions = {
  auth: {
    persistSession: true,
  },
  storage: {
    url: 'https://ciopzgckccyemzhdnguu.supabase.co/storage/v1/s3',
    region: 'eu-central-1',
  },
};

const supabase = createClient(supabaseUrl, supabaseKey, supabaseOptions);

const SupabaseContext = createContext();

export const SupabaseProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  const handleAuthStateChange = useCallback(
    async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    },
    []
  );

  useEffect(() => {
    const getInitialSession = async () => {
      const session = await supabase.auth.getSession();
      handleAuthStateChange(null, session.data.session);
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      authListener?.unsubscribe?.();
    };
  }, [handleAuthStateChange]);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <SupabaseContext.Provider value={{ supabase, session, user, loading, logout }}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useAuth = () => useContext(SupabaseContext);