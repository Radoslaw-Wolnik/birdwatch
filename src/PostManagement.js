import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useAuth } from './SupabaseContext';
import useFetchNames from './useFetchNames';

const PostManagement = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [selectedBird, setSelectedBird] = useState('');
  const { birdNames, loading, error } = useFetchNames();
  const [newPost, setNewPost] = useState({
    description: '',
    lat: '',
    lng: '',
    image: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, [currentPage, searchQuery, fetchPosts]);

  const fetchPosts = async () => {
    try {
      const { data, error, count } = await supabase
        .from('Posts')
        .select('*', { count: 'estimated' })
        .ilike('description', `%${searchQuery}%`)
        .range((currentPage - 1) * 10, currentPage * 10 - 1);
      if (error) {
        throw error;
      }
      setPosts(data);
      setTotalPages(Math.ceil(count / 10));
    } catch (error) {
      console.error('Error fetching posts:', error.message);
    }
  };

  const handleInputChange = (e) => {
    setNewPost({ ...newPost, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setNewPost({ ...newPost, image: e.target.files[0] });
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('Posts')
        .insert([
          {
            user_id: user.id,
            description: newPost.description,
            lat: parseFloat(newPost.lat),
            lng: parseFloat(newPost.lng),
          },
        ]);
      if (error) {
        throw error;
      }
      if (newPost.image) {
        const { error: uploadError } = await supabase.storage
          .from('Posts')
          .upload(`${user.id}/${Date.now()}`, newPost.image, {
            cacheControl: '3600',
            upsert: false,
          });
        if (uploadError) {
          throw uploadError;
        }
      }
      setNewPost({
        description: '',
        lat: '',
        lng: '',
        image: null,
      });
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error.message);
    }
  };

  const handleUpdatePost = async (postId, updateData) => {
    try {
      const { error } = await supabase
        .from('Posts')
        .update(updateData)
        .eq('id', postId);
      if (error) {
        throw error;
      }
      fetchPosts();
    } catch (error) {
      console.error('Error updating post:', error.message);
    }
  };

  const handleDeletePost = async (postId) => {
    setPostToDelete(postId);
    setShowConfirmationModal(true);
  };

  const confirmDeletePost = async () => {
    try {
      const { error } = await supabase.from('Posts').delete().eq('id', postToDelete);
      if (error) {
        throw error;
      }
      setShowConfirmationModal(false);
      setPostToDelete(null);
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error.message);
    }
  };

  const cancelDeletePost = () => {
    setShowConfirmationModal(false);
    setPostToDelete(null);
  };

  const handleSearchQueryChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };


  return (
    <div>
      <h2>Post Management</h2>
      <form onSubmit={handleCreatePost}>
        <h3>Create Post</h3>
        <label htmlFor="bird-select">Select Bird:</label>
        <select
          id="bird-select"
          value={selectedBird ? selectedBird.name : ''}
          onChange={(event) => {setSelectedBird(event.target.value);}}
        >
          {loading ? (
            <option value="" disabled>
              Loading...
            </option>
          ) : error ? (
            <option value="" disabled>
              Error: {error}
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
        <textarea
          name="description"
          placeholder="Description"
          value={newPost.description}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="lat"
          placeholder="Latitude"
          value={newPost.lat}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="lng"
          placeholder="Longitude"
          value={newPost.lng}
          onChange={handleInputChange}
        />
        <input type="file" onChange={handleImageChange} />
        <button type="submit">Create Post</button>
      </form>
      <div>
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={handleSearchQueryChange}
        />
      </div>
      <h3>Posts</h3>
      <table>
        <thead>
          <tr>
            <th>Bird</th>
            <th>created_at</th>
            <th>Description</th>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Image</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id}>
              <td>{birdNames[post.bird_id]}</td>
              <td>{post.created_at}</td>
              <td>{post.description}</td>
              <td>{post.lat}</td>
              <td>{post.lng}</td>
              <td>
                {post.has_photos > 0 ? (
                  <><img
                    src={`${supabase.storage.url}/object/public/Posts/${post.user_id}/${post.id}/${birdNames[post.bird_id]}_0.png`}
                    alt={`${birdNames[post.bird_id]}`}
                    style={{ maxWidth: '100px' }}
                  /></>
                ) : (<p>no image</p>)}
              </td>
              <td>
                <button
                  onClick={() =>
                    handleUpdatePost(post.id, {
                      description: 'Updated Description',
                    })
                  }
                >
                  Update
                </button>
                <button onClick={() => handleDeletePost(post.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        {totalPages > 1 && (
          <div>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button key={page} onClick={() => handlePageChange(page)} disabled={page === currentPage}>
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
      {showConfirmationModal && (
        <div className="confirmation-modal">
          <div className="modal-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this post?</p>
            <div>
              <button onClick={confirmDeletePost}>Confirm</button>
              <button onClick={cancelDeletePost}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostManagement;