import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { supabase } from './supabaseClient';
import useFetchNames from './useFetchNames';
import PostModal from './PostModal';
import './MapPage.css';

const MapPage = ({ match }) => {
  const { lat, lng } = match.params;
  const mapRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loadingMap, setLoadingMap] = useState(true);
  const [errorMap, setErrorMap] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loader, setLoader] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedBirdName, setSelectedBirdName] = useState('');
  const [selectedUsername, setSelectedUsername] = useState('');

  const { birdNames, loading} = useFetchNames();



  const createMap = useCallback(async (center) => {
    try {

      const map = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom: 12,
      });

      const { data, error } = await supabase.from('Places').select('*');

      if (error) {
        console.error('Error fetching places:', error);
        setErrorMap(error.message);
        return;
      }

      setPlaces(data);

      if (loading || error) {
        // If still loading or there's an error, don't render markers
        return;
      }

      places.forEach((place) => {
        //console.log(place);
        const iconSrc = `${supabase.storage.url}/object/public/Bird_Icons/${place.bird_id}.png`;
        //console.log(iconSrc);
        const markerIcon = iconSrc
        ? {
            url: iconSrc,
            scaledSize: new window.google.maps.Size(32, 32),
          }
        : {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: 'red',
            fillOpacity: 0.8,
            strokeWeight: 1,
            strokeColor: 'white',
          };

      const marker = new window.google.maps.Marker({
        position: { lat: place.lat, lng: place.lng },
        map: map,
        title: birdNames[place.bird_id],
        icon: markerIcon,
      });

        marker.addListener('mouseover', () => {

          // Show bird photo on hover
          // no i dont want that any more
        });

        marker.addListener('click', async () => {
          try {
            const { data: postData, error } = await supabase
              .from('Posts')
              .select('*')
              .eq('id', place.post_id)
              .single();

            if (error) {
              console.error('Error fetching post:', error.message);
            } else {
              const { data: userData, error: userError } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', postData.user_id)
                .single();

              if (userError) {
                console.error('Error fetching user:', userError.message);
              } else {
                setSelectedPost(postData);
                setSelectedBirdName(birdNames[place.bird_id]);
                setSelectedUsername(userData.username);
                setShowModal(true);
              }
            }
          } catch (err) {
            console.error('Error fetching post and user data:', err);
          }
        });


      });

      setLoadingMap(false); // Set loading to false after map is initialized
    } catch (err) {
      console.error('Error creating map:', err);
      setErrorMap(err.message);
    }
  },[loadingMap, birdNames]);

  useEffect(() => {
    const initializeScript = async () => {
      const loader = new Loader({
        apiKey: 'AIzaSyARi-kUu_m7dTo5nXxLjPfiueU8iC4EIAU',
        version: 'weekly',
      });
      await loader.load();
      setLoader(loader);
      setScriptLoaded(true);
    };

    initializeScript();
  }, []);

  const initializeMap = useCallback(async () => {
    try {
      //console.log(lat, lng);

      if (!lat || !lng) {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              createMap(userLocation);
            },
            () => {
              const defaultLocation = { lat: 51.5074, lng: -0.1278 };
              createMap(defaultLocation);
            }
          );
        } else {
          const defaultLocation = { lat: 51.5074, lng: -0.1278 };
          createMap(defaultLocation);
        }
      } else {
        //console.log(typeof lat, lat);
        const receivedLocation = { lat: parseFloat(lat), lng: parseFloat(lng) };
        createMap(receivedLocation);
      }
    } catch (err) {
      console.error('Error initializing map:', err);
      setErrorMap(err.message);
    }
  }, [lat, lng, createMap]);

  useEffect(() => {
    if (scriptLoaded && loader) {
      initializeMap();
    }
  }, [scriptLoaded, loader, initializeMap]);

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPost(null);
    setSelectedBirdName('');
    setSelectedUsername('');
  };


  return (
    <div className="map-page">
      <div className="main">
        {loadingMap && <div className="temporary-container"><p>Loading...</p></div>}
        {errorMap && <div className="temporary-container"><p>Error: {errorMap}</p></div>}
        <div ref={mapRef} style={{ width: '100%', height: 'calc(100vh - 41px - 57px)' }} />
        <PostModal
          isOpen={showModal}
          onClose={handleCloseModal}
          post={selectedPost}
          birdName={selectedBirdName}
          username={selectedUsername}
        />
      </div>
    </div>
  );
};

export default MapPage;
