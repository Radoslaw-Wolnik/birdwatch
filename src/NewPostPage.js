import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './SupabaseContext';
import { supabase } from './supabaseClient';
import './NewPostPage.css';
import { Loader } from '@googlemaps/js-api-loader';
import useFetchNames from './useFetchNames';
import KomunikatModal from './KomunikatModal';

const NewPostPage = () => {
  const { user } = useAuth();
  const [selectedBird, setSelectedBird] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState(null);
  const { birdNames, loading : loadingBirdNames, error : errorBirdNames} = useFetchNames();

  const [showKomunikatModal, setShowKomunikatModal] = useState(false);


  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  //const [markerPosition, setMarkerPosition] = useState(null);
  // const [markerLocation, setMarkerLocation] = useState(null)

  const userId = user ? user.id : null; // Extract userId from user object

  useEffect(() => {
    const loader = new Loader({
      // proces.env.REACT_APP_GMAP_KEY
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
      
      // Use functional update to avoid adding 'marker' as a dependency
  
      const updateMarkerPosition = (event) => {
        const newPosition = event.latLng;
        newMarker.setPosition(newPosition);
        setMarker(() => {
          console.log(newMarker.getPosition().lat());
          console.log(newMarker.getPosition().lng());
          return newMarker;
        });
      };
      
      map.addListener('click', updateMarkerPosition);
      newMarker.addListener('dragend', updateMarkerPosition);
      //newMarker.addListener('position_changed', updateMarkerPosition);
      
      // Update the marker state with the initial marker
      setMarker(newMarker);
  
      return () => {
        window.google.maps.event.clearInstanceListeners(newMarker);
        window.google.maps.event.clearInstanceListeners(map);
        // map.removeListener('click');
        // newMarker.removeListener('dragend', updateMarkerPosition);
        // newMarker.removeListener('position_changed', updateMarkerPosition);
      };
    }
  }, [map, location]);

  
  const handleBirdChange = (event) => {
    const selected = event.target.value;
    console.log(event.target.value);
    setSelectedBird(selected);
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
            .upload(`${userId}/${postId}/${birdNames[selectedBird]}_${index}`, photo);
  
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
          bird_id: selectedBird,
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
      handleOpenModal();
      console.log('Post created successfully');
    } catch (error) {
      console.error('Error submitting post:', error.message);
    }
  };

  const handleOpenModal = () => {
    setShowKomunikatModal(true);
  };

  const handleCloseModal = () => {
    setShowKomunikatModal(false);
    // here we could redirect after login out
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
          {marker && (
            <div>
              <p>Pin location:</p>
              <p>Latitude: {marker.getPosition().lat()}</p>
              <p>Longitude: {marker.getPosition().lng()}</p>
            </div>
          )}
          <div ref={mapRef} style={{ height: '400px' }} />
          <button type="submit">Post</button>
        </form>
        <KomunikatModal isOpen={showKomunikatModal} onClose={handleCloseModal} title="Success" description="Post created succesfully" />
      </main>
    </div>
  );
};

export default NewPostPage;
