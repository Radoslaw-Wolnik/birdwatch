import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useAuth } from './SupabaseContext';
import AuthCheck from './AuthCheck';
import ProfilePicture from './ProfilePicture';
import { Link } from 'react-router-dom';
import './Friends.css';
//import useFetchNames from './useFetchNames';

const Friends = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [frinedPurgatory, setFriendPurgatory] = useState([]);
  const [friends, setFriends] = useState([]);
  const [clickedUsers, setClickedUsers] = useState([]);
  //const { usernames } = useFetchNames();

  // you can refactor fetchRequestData, fetchFriendData, fetchPurgatoryData 
  // to not include usernames
  // and have usernames from usernames[user.id] || '' - our custom hook


  const fetchRequestData = async () => {
    try {
      const { data: requests, error: requestError } = await supabase
        .from('Friends')
        .select('id, time, from:user_id_A(id, username), to:user_id_B(id, username)')
        .eq('user_id_B', user.id)
        .eq('accepted', false);
      if (requestError) {
        throw requestError;
      }
      setFriendRequests(requests);
    } catch (error) {
      console.error('Error fetching friend data:', error.message);
    }
  };

  const fetchFriendData = async () => {
    try {
      const { data: friendsData, error: friendsError } = await supabase
        .from('Friends')
        .select('id, time, from:user_id_A(id, username), to:user_id_B(id, username)')
        .or(`user_id_A.eq.${user.id},user_id_B.eq.${user.id}`)
        .eq('accepted', true);

      if (friendsError) {
        throw friendsError;
      }
      setFriends(friendsData);
    } catch (error) {
      console.error('Error fetching friend data:', error.message);
    }
  };
    
  const fetchPurgatoryData = async () => {
    try {
      const { data: purgatoryData, error: purgatoryError } = await supabase
        .from('Friends')
        .select('id, time, from:user_id_A(id, username), to:user_id_B(id, username)')
        .eq('user_id_A', user.id)
        .eq('accepted', false);

      if (purgatoryError) {
        throw purgatoryError;
      }
      setFriendPurgatory(purgatoryData);
      // console.log(purgatoryData);
    } catch (error) {
      console.error('Error fetching friend data:', error.message);
    }
  };
  
  useEffect(() => {
    if (user.id) {
      fetchRequestData();
      fetchFriendData();
      fetchPurgatoryData();
    }
  }, [user.id]);
  

  const handleSearchQueryChange = (e) => {
    setSearchQuery(e.target.value);
  };


  const handleSearch = async () => {
    try {
      const excludedIds = [...friendRequests.map(req => req.from.id), ...frinedPurgatory.map(purg => purg.to.id), ...friends.flatMap(friend => [friend.from.id, friend.to.id]),];
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${searchQuery}%`)
        .neq('id', user.id)
        .not('id', 'in', `(${excludedIds.join(',')})`);

      if (error) {
        throw error;
      }

      setSearchResults(data);
      // console.log(`(${excludedIds.join(',')})`)
      // console.log(searchResults);
    } catch (error) {
      console.error('Error searching for users:', error.message);
    }
  };

  const handleAddFriend = async (userId) => {
    try {
      const { error } = await supabase
        .from('Friends')
        .insert({ user_id_A: user.id, user_id_B: userId });

      if (error) {
        throw error;
      }
      
      setClickedUsers(prevState => [...prevState, userId]);
      // Update friend requests and friends data
      fetchPurgatoryData();


    } catch (error) {
      console.error('Error sending friend request:', error.message);
    }
  };

  const handleAcceptFriendRequest = async (requestId) => {
    try {
      const { error } = await supabase
        .from('Friends')
        .update({ accepted: true })
        .eq('id', requestId);

      if (error) {
        throw error;
      }

      // Update friend requests and friends data
      fetchFriendData();
      fetchRequestData();

    } catch (error) {
      console.error('Error accepting friend request:', error.message);
    }
  };

  const handleDenyFriendRequest = async (requestId) => {
    try {
      const { error } = await supabase
        .from('Friends')
        .delete()
        .eq('id', requestId);

      if (error) {
        throw error;
      }

      // Update friend requests data
      fetchRequestData();
    } catch (error) {
      console.error('Error denying friend request:', error.message);
    }
  };

  const handleUndoFriendRequest = async (requestId) => {
    try {
      const { error } = await supabase
        .from('Friends')
        .delete()
        .eq('id', requestId);

      if (error) {
        throw error;
      }

      // Update friend requests data
      fetchPurgatoryData();
    } catch (error) {
      console.error('Error undoing friend request:', error.message);
    }
  };

  const handleUndoFriendship = async (requestId) => {
    try {
      const { error } = await supabase
        .from('Friends')
        .delete()
        .eq('id', requestId);

      if (error) {
        throw error;
      }

      // Update friend data
      fetchFriendData();
    } catch (error) {
      console.error('Error undoing friend request:', error.message);
    }
  };

  return (
    <AuthCheck>
      <div className="friends">
        <main>
          <section className="find-friends">
            <h2>Find new friends:</h2>
            <div>
              <input
                type="text"
                placeholder="Search for users..."
                value={searchQuery}
                onChange={handleSearchQueryChange}
              />
              <button onClick={handleSearch}>Search</button>
            </div>
            <div className="search-results">
              <h2>Search results for: {searchQuery}</h2>
              {searchResults == 0 ? (
                <p>No results found.</p>
              ) : (
                <ul className="user-list">
                  {searchResults && searchResults.map((user) => (
                    <li key={user.id} className="user-item">
                      <Link to={`/profile/${user.username}`} className="user-link">
                        <div className="user-info">
                          <div className="friendly-profile-picture-container">
                          <ProfilePicture
                            userId={user.id}
                            username={user.username}
                            canChangeProfilePicture={false}
                          />
                          </div>
                          <div className="username-container">
                            <span className="user-name">{user.username}</span>
                          </div>
                        </div>
                      </Link>
                      <button
                        className="add-friend-btn"
                        onClick={() => handleAddFriend(user.id)}
                        disabled={clickedUsers.includes(user.id)} // Disable the button if user has already been clicked
                      >
                        {clickedUsers.includes(user.id) ? "Sent" : "Add Friend"} {/* Change button text based on whether the user has been clicked */}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="pending-requests">
            <h2>Pending:</h2>
            <ul className="user-list">
              {friendRequests && friendRequests.map((data) => (
                <li key={data.from.id} className="user-item">
                  <div>
                    <Link to={`/profile/${data.from.username}`}>
                      <div className="user-info">
                        <div className="friendly-profile-picture-container">
                          <ProfilePicture
                            userId={data.from.id}
                            username={data.from.username}
                          />
                        </div>
                        <div className="username-container">
                          <span className="user-name">{data.from.username}</span>
                        </div>
                      </div>
                      <div className="date-container">
                        <span className="date">{data.time}</span>
                      </div>
                    </Link>
                  </div>
                  <div>
                    <button
                      className="accept-btn"
                      onClick={() => handleAcceptFriendRequest(data.id)}
                    >
                      Accept
                    </button>
                    <button
                      className="decline-btn"
                      onClick={() => handleDenyFriendRequest(data.id)}
                    >
                      Deny
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <ul className="user-list">
              {frinedPurgatory.map((data) => (
                <li key={data.to.id} className="user-item">
                  <div>
                    <Link to={`/profile/${data.to.username}`}>
                      <div className="user-info">
                        <div className="friendly-profile-picture-container">
                          <ProfilePicture
                            userId={data.to.id}
                            username={data.to.username}
                          />
                        </div>
                        <div className="username-container">
                          <span className="user-name">{data.to.username}</span>
                        </div>
                      </div>
                      <div className="date-container">
                        <span className="date">{data.time}</span>
                      </div>
                    </Link>
                  </div>
                  <div>
                    <button
                      className="undo-btn"
                      onClick={() => handleUndoFriendRequest(data.id)}
                    >
                      Undo
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="my-friends">
            <h2>My friends:</h2>
            <ul className="user-list">
              {friends && friends.map((data) => {
                const friend = data.to.id === user.id ? data.from : data.to;
                return (
                  <li key={friend.id} className="user-item">
                    <div>
                      <Link to={`/profile/${friend.username}`}>
                        <div className="user-info">
                          <div className="friendly-profile-picture-container">
                            <ProfilePicture
                              userId={friend.id}
                              username={friend.username}
                            />
                          </div>
                          <div className="username-container">
                            <span className="user-name">{friend.username}</span>
                          </div>
                        </div>
                        <div className="date-container">
                          <span className="date">{data.time}</span>
                        </div>
                      </Link>
                    </div>
                    <div>
                    <button
                      className="accept-btn"
                      onClick={() => handleUndoFriendship(data.id)}
                    >
                      Remove
                    </button>
                  </div>
                  </li>
                );
              })}
            </ul>
          </section>

        </main>
      </div>
    </AuthCheck>
  );
};

export default Friends;