import { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import UserPosts from './UserPosts';
import { useAuth } from './SupabaseContext';
import { useHistory } from 'react-router-dom';
import './Feed.css';

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [noFriends, setNoFriends] = useState(false);
  const userPostsContainerRef = useRef(null);
  const history = useHistory();

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
    const fetchFriendsPosts = async () => {
      try {
        const { data: friends, error: friendsError } = await supabase
          .from('Friends')
          .select('id, time, from:user_id_A(id, username), to:user_id_B(id, username)')
          .or(`user_id_A.eq.${user.id},user_id_B.eq.${user.id}`)
          .eq('accepted', true);

        if (friendsError) {
          throw friendsError;
        } else {
          if (friends.length === 0) {
            setNoFriends(true);
            setPosts([]);
            return;
          }
        }

        const friendIds = friends.flatMap(friend => [friend.from.id, friend.to.id])

        console.log(friendIds);
        console.log(`(${friendIds.join(',')})`)

        // Fetch posts from the user's friends, ordered from newest to oldest
        const { data: friendsPosts, error: postsError } = await supabase
          .from('Posts')
          .select('*')
          .in('user_id', friendIds) // Includes the user's own posts as well
          .order('created_at', { ascending: false });

        if (postsError) {
          throw postsError;
        }

        setPosts(friendsPosts);
      } catch (error) {
        console.error('Error fetching friends posts:', error.message);
      }
    };

    fetchFriendsPosts();
  }, [user]);

  return (
    <div className="feed">
      <main>
        <h2>Friends' Posts</h2>
        {noFriends ? (
          <p>You don't have any friends yet. Add some friends to see their posts.</p>
        ) : (
          <div className="user-posts-container" ref={userPostsContainerRef}>
              <UserPosts posts={posts} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Feed;