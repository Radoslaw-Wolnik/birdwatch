import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useAuth } from './SupabaseContext';
import { supabase } from './supabaseClient';
import ProfilePicture from './ProfilePicture';
import UserPosts from './UserPosts';
import './Profile.css';

const Profile = () => {
  const { user, session } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const history = useHistory();
  const { username } = useParams();
  const userPostsContainerRef = useRef(null);

  const fetchProfileData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();

      if (error) {
        throw error;
      }

      setProfileData(data);
      fetchPosts(data.id);
    } catch (error) {
      console.error('Error fetching profile data:', error.message);
    }
  }, [username]);

  const fetchPosts = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('Posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error.message);
    }
  };

  useEffect(() => {
    if (user) {
      const userPostsContainer = userPostsContainerRef.current;
      const handleWheel = (event) => {
        if (!event.shiftKey) {
          event.preventDefault(); // Prevent vertical scrolling
          userPostsContainer.scrollLeft += event.deltaY; // Scroll horizontally
        }
      };

      userPostsContainer.addEventListener('wheel', handleWheel);

      return () => {
        userPostsContainer.removeEventListener('wheel', handleWheel);
      };
    } else {
      history.push('/login');
    }
  }, [user, history]);

  useEffect(() => {
    if (session) {
      fetchProfileData();
    }
  }, [session, fetchProfileData]);

  if (!user) {
    return null;
  }

  return (
    <div className="profile">
      <main>
        <section>
          <div className="profile-info">
            <h2>{username}</h2>
            <div className="profile-picture-container-new">
              <ProfilePicture
                userId={profileData?.id || user.id}
                username={profileData?.username || user.email}
                canChangeProfilePicture={user.id === profileData?.id}
              />
            </div>
          </div>
        </section>
        <section className="user-posts-section">
          {user.id === profileData?.id ? ( <h2>My posts:</h2>) : ( <h2>{username}'s posts:</h2>)}
         
          <div className="user-posts-container" ref={userPostsContainerRef}>
            <UserPosts posts={posts} />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Profile;