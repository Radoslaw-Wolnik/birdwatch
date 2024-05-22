import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './supabaseClient';
import './LogIn.css';
import { useAuth } from './SupabaseContext';

const LogIn = () => {
  const { session } = useAuth();
  const { user } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: username,
        password,
      });


      if (error) {
        setError(error.message);
      } else {
        // console.log(data.user.id);
        // Fetch the username from the public.profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', data.user.id)
          .single();
          
        // console.log('profiledata: ', profileData);
        if (profileError) {
          setError(profileError.message);
        } else {
          console.log('Logged in with username:', profileData.username);
          console.log(user);
          console.log(session);
          // setUser(data);
          // Redirect or perform other actions after successful login
        }
      }
    } catch (err) {
      setError(err.message);
    }

    // Reset form fields
    setUsername('');
    setPassword('');
  };

  return (
    <div className="login">
      <main>
        <section>
          <h2>Log In</h2>
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username">Username (email)</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span>
                <Link to="/forgot-password">Forgot Password?</Link>
              </span>
            </div>
            <button type="submit">Log In</button>
          </form>
          <div className="additional-links">
            <span>
              Don't have an account? <Link to="/signup">Sign Up</Link>
            </span>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LogIn;