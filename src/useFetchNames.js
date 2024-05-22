import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const useFetchNames = () => {
  const [birdNames, setBirdNames] = useState({});
  const [usernames, setUsernames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBirdNames = async () => {
      try {
        const { data: birds, error: birdsError } = await supabase
          .from('Birds')
          .select('id, name');

        if (birdsError) {
          throw birdsError;
        }

        const birdNamesDict = {};
        birds.forEach(bird => {
          birdNamesDict[bird.id] = bird.name;
        });

        setBirdNames(birdNamesDict);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching bird names:', error.message);
        setError(error.message);
        setLoading(false);
      }
    };

    const fetchUsernames = async () => {
      try {
        const { data, error: usernamesError } = await supabase
          .from('profiles')
          .select('id, username');

        if (usernamesError) {
          throw usernamesError;
        }

        const usernamesDict = {};
        data.forEach(user => {
          usernamesDict[user.id] = user.username;
        });

        setUsernames(usernamesDict);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching usernames:', error.message);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchBirdNames();
    fetchUsernames();
  }, []);

  return { birdNames, usernames, loading, error };
};

export default useFetchNames;

/*
import useMemo from react
const [fetchedUserIds, setFetchedUserIds] = useState(new Set());
...
const unfetchedUserIds = useMemo(() => {
    const userIds = new Set();
    posts.forEach(post => {
      if (!fetchedUserIds.has(post.user_id)) {
        userIds.add(post.user_id);
      }
    });
    return userIds;
  }, [posts, fetchedUserIds]);
*/