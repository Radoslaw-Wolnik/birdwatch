import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from './SupabaseContext';
import { supabase } from './supabaseClient';

const Navbar = () => {
  const { session, logout } = useAuth();
  const [moderator, setModerator] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [developer, setDeveloper] = useState(false);
  const [username, setUsername] = useState(null);

  const fetchUsername = useCallback(async () => {
    if (!session || !session.user || !session.user.id) {
      return;
    }
  
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', session.user.id)
        .single();
  
      if (error) {
        throw error;
      }
  
      setUsername(data.username);
    } catch (error) {
      console.error('Error fetching profile data:', error.message);
    }
  }, [session]);
  
  const isRole = useCallback(async () => {
    if (!session || !session.user || !session.user.id) {
      return;
    }
  
    try {
      const { data : dev, error : devError } = await supabase
        .from('devs')
        .select('created_at')
        .eq('user_id', session.user.id);
  
      if (devError) {
        throw devError;
      } else{
        setDeveloper(dev && dev.length > 0);
      }

      const { data : mod, error : modError } = await supabase
        .from('Moderators')
        .select('created_at')
        .eq('user_id', session.user.id);
      
      if (modError) {
        throw modError;
      } else {
        setModerator(mod && mod.length > 0);
      }

      const { data : admin, error : adminError} = await supabase
        .from('Admin')
        .select('created_at')
        .eq('user_id', session.user.id);

      if (adminError) {
        throw adminError;
      } else {
        setAdmin(admin && admin.length > 0);
      }
  
      
    } catch (error) {
      console.error('Error getting status:', error.message);
    }
  }, [session]);

  useEffect(() => {

    if (session) {
      fetchUsername();
      isRole();
    }
  }, [session, fetchUsername, isRole]);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Bird Watching App</Link>
      </div>
      <div className="navbar-links">
        {session ? (
          <>
            {moderator ? (
              <>
                <Link to="/moderate" className="nav-link">Moderate</Link>
              </>
            ) : <></>}
            {developer ? (
              <>
                <Link to="/dev/management/users" className="nav-link">Dev/users</Link>
                <Link to="/dev/management/posts" className="nav-link">Dev/posts</Link>
                <Link to="/dev/management/birds" className="nav-link">Dev/birds</Link>
                <Link to="/dev/management/credits" className='nav-link'>Dev/credits</Link>
              </>
            ) : <></>}
            {admin ? (
              <>
                <Link to="/admin/..." className="nav-link">Admin/sth</Link>
              </>
            ) : <></>}
            <Link to="/new-post" className="nav-link">New Post</Link>
            <Link to="/feed" className="nav-link">Feed</Link>
            <Link to="/friends" className="nav-link">Friends</Link>
            <Link to={`/profile/${username}`} className="nav-link">Profile</Link>
            <button onClick={logout} className="nav-link">Logout</button>
          </>
        ) : (
          <Link to="/login" className="nav-link">Log In</Link>
        )}
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/birds" className="nav-link">Birds</Link>
        <Link to="/map" className="nav-link">Map</Link>
        <Link to="/about" className="nav-link">About</Link>
        <Link to="/credits" className="nav-link">Credits</Link>
      </div>
    </nav>
  );
};

export default Navbar;
  