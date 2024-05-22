import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Link } from 'react-router-dom';
import { useAuth } from './SupabaseContext';
import ImageModal from './ImageModal';

const Post = ({ post, birdName, username }) => {
  const { user } = useAuth();
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [totalLikes, setTotalLikes] = useState(0);

  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');

  useEffect(() => {
    const fetchPostPictures = async () => {
      try {
        const { data, error } = await supabase
          .storage
          .from('Posts')
          .list(`${post.user_id}/${post.id}/`, {
            limit: 10,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' },
          });

        if (error) {
          throw error;
        }

        // Process downloaded photo data as needed
        if (data !== null) {
          setImages(data);
        }
      } catch (error) {
        console.error(`Error fetching photos for post ${post.id}:`, error.message);
      }
    };
    fetchPostPictures();

    // Check if the user has liked this post
    const checkIfLiked = async () => {
      const { data, error } = await supabase
        .from('Posts_likes')
        .select('*')
        .eq('post_id', post.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error checking if post is liked:', error.message);
      } else {
        setIsLiked(data.length > 0);
      }
    };
    checkIfLiked();

    // Fetch total likes for the post
    const fetchTotalLikes = async () => {
      const { count, error } = await supabase
        .from('Posts_likes')
        .select('*', { count: 'estimated' })
        .eq('post_id', post.id);

      if (error) {
        console.error('Error fetching total likes:', error.message);
      } else {
        setTotalLikes(count);
      }
    };
    fetchTotalLikes();
  }, [post.id, user]);

  const handleLike = async () => {
    if (isLiked) {
      // Unlike the post
      const { error } = await supabase
        .from('Posts_likes')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error unliking post:', error.message);
      } else {
        setIsLiked(false);
        setTotalLikes(totalLikes - 1);
      }
    } else {
      // Like the post
      const { error } = await supabase
        .from('Posts_likes')
        .insert([{ post_id: post.id, user_id: user.id }]);

      if (error) {
        console.error('Error liking post:', error.message);
      } else {
        setIsLiked(true);
        setTotalLikes(totalLikes + 1);
      }
    }
  };

    
  

  const handlePrevClick = () => {
    setCurrentImageIndex(prevIndex => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const handleNextClick = () => {
    setCurrentImageIndex(prevIndex => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImageUrl(imageUrl);
    setShowImageModal(true);
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setSelectedImageUrl('');
  };

  

  return (
    <div className="post">
      <h3>{birdName}</h3>
      <p>by {username}</p>
      <p>{new Date(post.created_at).toLocaleString()}</p>
      <p>{post.description}</p>
      {images.length > 0 && (
        <div className="photos-container">
          <img
            src={`${supabase.storage.url}/object/public/Posts/${post.user_id}/${post.id}/${images[currentImageIndex].name}`}
            alt={`Photo of ${birdName} number: ${currentImageIndex}`}
            onClick={() =>
              handleImageClick(
                `${supabase.storage.url}/object/public/Posts/${post.user_id}/${post.id}/${images[currentImageIndex].name}`
              )
            }
            className="post-image"
            onError={() => console.error(`Error loading photo ${currentImageIndex} for post ${post.id}`)}
          />
          {images.length > 1 && (
            <div className="navigation-arrows">
              <button onClick={handlePrevClick}>&#10094;</button>
              <button onClick={handleNextClick}>&#10095;</button>
            </div>
          )}
        </div>
      )}
      <div>
        <Link to={`/map/${post.lat}/${post.lng}`}>
          <small>View on Map</small>
        </Link>
      </div>
      <div className="like-button">
        <span role="img" aria-label={isLiked ? 'Unlike' : 'Like'} onClick={handleLike} style={{ cursor: 'pointer' }}>
          {isLiked ? '❤️' : '🤍'}
        </span>
        <span>{totalLikes}</span>
      </div>
      <ImageModal isOpen={showImageModal} onClose={handleCloseImageModal} imageUrl={selectedImageUrl} />
    </div>
  );
};

export default Post;
