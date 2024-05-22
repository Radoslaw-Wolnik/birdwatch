import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import defPicture from './res/ProfilePicture/default.png';
import './ProfilePicture.css'

const ProfilePicture = ({ userId, username, canChangeProfilePicture }) => {
  const [profilePicture, setProfilePicture] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const { data, error } = await supabase.storage
          .from('Profile_pictures')
          .list(`${userId}/`, {
            limit: 1,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' },
          });

        if (error) {
          console.error('Error downloading profile picture:', error.message);
          setProfilePicture(null); // Set default profile picture
        } else {
          setProfilePicture(data);
        }
      } catch (error) {
        console.error('Error fetching profile picture:', error.message);
      }
    };

    fetchProfilePicture();
  }, [userId, username]);

  const handleProfilePictureUpload = async (event) => {
    try {
      setIsUploading(true);
      const file = event.target.files[0];
      const { error } = await supabase.storage
        .from('Profile_pictures')
        .upload(`${userId}/${username}.jpg`, file);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const profilePictureUrl =
    profilePicture && profilePicture.length > 0
      ? `${supabase.storage.url}/object/public/Profile_pictures/${userId}/${profilePicture[0].name}`
      : defPicture;

  return (
    <div
        className="profile-picture"
        style={{
          backgroundImage: `url(${profilePictureUrl || defPicture})`,
        }}
      >
      {canChangeProfilePicture && (
        <div className="change-profile-picture">
          <input
            type="file"
            onChange={handleProfilePictureUpload}
            disabled={isUploading}
          />
          {isUploading && <p>Uploading profile picture...</p>}
        </div>
      )}
    </div>
  );
};


export default ProfilePicture;