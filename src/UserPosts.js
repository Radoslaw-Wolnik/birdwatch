import React from 'react';
import useFetchNames from './useFetchNames';
import './UserPosts.css';
import Post from './Post';

// This component name should be MapPosts or sth like that
// it adds usernames and birdnames insted of IDs

const UserPosts = ({ posts }) => {
  const { birdNames, usernames, loading, error } = useFetchNames();


  return (
    <div className="user-posts">
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <div className="posts-scroll">
          {posts.map(post => (
            <Post
              key={post.id}
              post={post}
              birdName={birdNames[post.bird_id] || ''}
              username={usernames[post.user_id] || ''}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserPosts;