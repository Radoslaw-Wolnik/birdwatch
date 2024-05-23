import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './SupabaseContext';
import { supabase } from './supabaseClient';
import './NewPostPage.css';
import { Loader } from '@googlemaps/js-api-loader';
import useFetchNames from './useFetchNames';

const NewPostPage = () => {
  const { user } = useAuth();
  const [selectedBird, setSelectedBird] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState(null);
  const { birdNames, loading : loadingBirdNames, error : errorBirdNames} = useFetchNames();


  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  // const [markerLocation, setMarkerLocation] = useState(null)

  const userId = user ? user.id : null; // Extract userId from user object

  useEffect(() => {
    const loader = new Loader({
      apiKey: 'AIzaSyARi-kUu_m7dTo5nXxLjPfiueU8iC4EIAU',
      version: 'weekly',
    });

    loader.load().then((google) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setLocation(userLocation);
          },
          () => {
            const defaultLocation = { lat: 51.5074, lng: -0.1278 };
            setLocation(defaultLocation);
          }
        );
      } else {
        const defaultLocation = { lat: 51.5074, lng: -0.1278 };
        setLocation(defaultLocation);
      }
    });
  }, []);

  useEffect(() => {
    if (location) {
      const google = window.google;
      const map = new google.maps.Map(mapRef.current, {
        center: location,
        zoom: 12,
      });
      setMap(map);
      // setMarkerLocation(location);
    }
  }, [location]);

  useEffect(() => {
    if (map && location) {
      const newMarker = new window.google.maps.Marker({
        position: location,
        map: map,
        draggable: true,
      });
  
      const updateMarkerPosition = () => {
        setMarker(newMarker);
        setMarkerPosition({
          lat: newMarker.getPosition().lat(),
          lng: newMarker.getPosition().lng(),
        });
      };
  
      newMarker.addListener('dragend', updateMarkerPosition);
      newMarker.addListener('position_changed', updateMarkerPosition);
  
      return () => {
        newMarker.removeListener('dragend', updateMarkerPosition);
        newMarker.removeListener('position_changed', updateMarkerPosition);
      };
    }
  }, [map, location]);

  
  const handleBirdChange = (event) => {
    const selectedBird = event.target.value;
    setSelectedBird(selectedBird);
  };


  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleImageChange = (event) => {
    const files = event.target.files;
    setImages([...images, ...files]);
  };



  const uploadPhotos = async (postId, selectedBird) => {
    try {
      // Upload each photo to the user's folder with post_id and bird_name
      await Promise.all(
        images.map(async (photo, index) => {
          const { error } = await supabase.storage
            .from('Posts')
            .upload(`${userId}/${postId}/${selectedBird.name}_${index}`, photo);
  
          if (error) {
            throw error;
          }
        })
      );
    } catch (error) {
      console.error('Error uploading photos:', error.message);
    }
  };


  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // Check if the user wants to submit photos
      const hasPhotos = images.length;
  
      // Insert a new row into the "posts" table
      const { data, error: postError } = await supabase
        .from('Posts')
        .insert({
          user_id: userId,
          bird_id: selectedBird.id,
          description: description,
          lat: marker ? marker.getPosition().lat() : null,
          lng: marker ? marker.getPosition().lng() : null,
          has_photos: hasPhotos,
        })
        .select()
        .single();
  
      if (postError) {
        throw postError;
      }
  
      // Check if the post was created successfully
      if (!data || !data.id) {
        throw new Error('Error creating post');
      }
  
      const postId = data.id;
  
      // If the user has photos, upload and insert them
      if (hasPhotos) {
        try {
          await uploadPhotos(postId, selectedBird);
        } catch (error) {
          console.error('Error uploading or inserting photos:', error.message);
        }
      }
  
      // Handle post submission success...
      console.log('Post created successfully');
    } catch (error) {
      console.error('Error submitting post:', error.message);
    }
  };
  
  return (
    <div className="new-post-page">
      <main>
        <h2>New Post</h2>
        <form onSubmit={handleSubmit}>
          <div>
              
            <label htmlFor="bird">Select Bird:</label>
            <select
              id="bird"
              value={selectedBird ? selectedBird.name : ''}
              onChange={handleBirdChange}
            >
              {loadingBirdNames ? (
                <option value="" disabled>
                  Loading...
                </option>
              ) : errorBirdNames ? (
                <option value="" disabled>
                  Error: {errorBirdNames}
                </option>
              ) : Object.keys(birdNames).length > 0 ? (
                Object.keys(birdNames).map((birdID) => (
                  <option key={birdID} value={birdID}>
                    {birdNames[birdID]}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No bird names available
                </option>
              )}
            </select>
          </div>
          <div>
            <label htmlFor="description">Description:</label>
            <textarea id="description" value={description} onChange={handleDescriptionChange}></textarea>
          </div>
          <div>
            <label htmlFor="image">Upload Images:</label>
            <input type="file" id="image" multiple onChange={handleImageChange} />
          </div>
          {markerPosition && (
            <div>
              <p>Pin location:</p>
              <p>Latitude: {markerPosition.lat}</p>
              <p>Longitude: {markerPosition.lng}</p>
            </div>
          )}
          <div ref={mapRef} style={{ height: '400px' }} />
          <button type="submit">Post</button>
        </form>
      </main>
    </div>
  );
};

export default NewPostPage;
