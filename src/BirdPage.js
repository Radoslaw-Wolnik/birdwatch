import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useHistory } from 'react-router-dom';

const BirdPage = ({ match }) => {
  const [bird, setBird] = useState(null);
  const history = useHistory();

  useEffect(() => {
    // Fetch detailed information about the selected bird based on the ID
    const fetchBirdDetails = async () => {
      try {
        const birdLink = match.params.link;
        console.log(birdLink);
        const { data, error } = await supabase
          .from('Birds')
          .select('*')
          .eq('link', birdLink)
          .single();
  
        if (error) {
          throw error;
        } else {
          setBird(data);
        }

      } catch (error) {
        console.error('Error fetching bird data:', error.message);
      }
    };

    fetchBirdDetails();
  }, [match.params.link]);

  const handleGoBack = () => {
    history.goBack(); // Navigate back in history
  };

  return (
    <div>
      <button onClick={handleGoBack}>Go Back</button>
      {bird && (
        <div>
          <h2>{bird.name}</h2>
          <p>{bird.description}</p>
          {/* Render map with pins of the specific bird */}
          {/* You can use a map library like Google Maps or Mapbox for this */}
        </div>
      )}
    </div>
  );
};

export default BirdPage;
