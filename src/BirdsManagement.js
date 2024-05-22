import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const BirdManagement = () => {
  const [birds, setBirds] = useState([]);
  const [newBird, setNewBird] = useState({
    name: '',
    description: '',
    link: '',
    species: '',
    photo: null,
    icon: null,
  });
  const [editingBird, setEditingBird] = useState(null);

  useEffect(() => {
    fetchBirds();
  }, []);

  const fetchBirds = async () => {
    try {
      const { data, error } = await supabase.from('Birds').select('*');
      if (error) {
        throw error;
      }
      setBirds(data);
    } catch (error) {
      console.error('Error fetching birds:', error.message);
    }
  };

  const handleInputChange = (e) => {
    setNewBird({ ...newBird, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    setNewBird({ ...newBird, photo: e.target.files[0] });
  };

  const handleIconChange = (e) => {
    setNewBird({ ...newBird, icon: e.target.files[0] });
  };

  const handleCreateBird = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.from('Birds').insert([
        {
          name: newBird.name,
          species: newBird.species,
          description: newBird.description,
          link: newBird.link,
        },
      ]).select();
      if (error) {
        throw error;
      }
      const birdId = data[0].id;
      if (newBird.photo) {
        const { error: uploadPhotoError } = await supabase.storage
          .from('Bird_Photos')
          .upload(`public/${newBird.link}.png`, newBird.photo, {
            cacheControl: '3600',
            upsert: false,
          });
        if (uploadPhotoError) {
          throw uploadPhotoError;
        }
      }
      if (newBird.icon) {
        const { error: uploadIconError } = await supabase.storage
          .from('Bird_Icons')
          .upload(`${birdId}.png`, newBird.icon, {
            cacheControl: '3600',
            upsert: false,
          });
        if (uploadIconError) {
          throw uploadIconError;
        }
      }
      clearForm();
      setNewBird({
        name: '',
        description: '',
        link: '',
        species: '',
        photo: null,
        icon: null,
      });
      fetchBirds();
    } catch (error) {
      console.error('Error creating bird:', error.message);
    }
  };

  const handleUpdateBird = (bird) => {
    setEditingBird(bird);
    setNewBird({
      name: bird.name,
      description: bird.description,
      link: bird.link,
      species: bird.species,
      photo: null,
      icon: null,
    });
  };

  const handleSaveBird = async (e) => {
    e.preventDefault();
    try {
      const isOnlyPhotoChanged =
        newBird.name === editingBird.name &&
        newBird.description === editingBird.description &&
        newBird.link === editingBird.link;
  
      if (isOnlyPhotoChanged) {
        if (newBird.photo) {
          const { error: deletePhotoError } = await supabase.storage
            .from('Bird_Photos')
            .remove([`public/${editingBird.link}.png`]);
          if (deletePhotoError) {
            throw deletePhotoError;
          }
          const { error: uploadPhotoError } = await supabase.storage
            .from('Bird_Photos')
            .upload(`public/${editingBird.link}.png`, newBird.photo, {
              cacheControl: '3600',
              upsert: true,
            });
          if (uploadPhotoError) {
            throw uploadPhotoError;
          }
        }
      } else {
        const { error } = await supabase
          .from('Birds')
          .update({
            name: newBird.name,
            species: newBird.species,
            description: newBird.description,
            link: newBird.link,
          })
          .eq('id', editingBird.id)
          .select();
        if (error) {
          throw error;
        }
        if (newBird.link !== editingBird.link) {
          const { error: renamePhotoError } = await supabase.storage
            .from('Bird_Photos')
            .renameObject(
              `public/${editingBird.link}.png`,
              `public/${newBird.link}.png`
            );
          if (renamePhotoError) {
            throw renamePhotoError;
          }
        }
        if (newBird.photo) {
          const { error: deletePhotoError } = await supabase.storage
            .from('Bird_Photos')
            .remove([`public/${editingBird.link}.png`]);
          if (deletePhotoError) {
            throw deletePhotoError;
          }
          const { error: uploadPhotoError } = await supabase.storage
            .from('Bird_Photos')
            .upload(`public/${newBird.link}.png`, newBird.photo, {
              cacheControl: '3600',
              upsert: true,
            });
          if (uploadPhotoError) {
            throw uploadPhotoError;
          }
        }
        if (newBird.icon) {
          const { error: deleteIconError } = await supabase.storage
            .from('Bird_Icons')
            .remove([`${editingBird.id}.png`]);
          if (deleteIconError) {
            throw deleteIconError;
          }
          const { error: uploadIconError } = await supabase.storage
            .from('Bird_Icons')
            .upload(`${newBird.id}.png`, newBird.icon, {
              cacheControl: '3600',
              upsert: true,
            });
          if (uploadIconError) {
            throw uploadIconError;
          }
        }
        setEditingBird(null);
        clearForm();
        fetchBirds();
      }
    } catch (error) {
      console.error('Error updating bird:', error.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingBird(null);
    clearForm();
    setNewBird({
      name: '',
      description: '',
      link: '',
      species: '',
      photo: null,
      icon: null,
    });
  };

  const handleDeleteBird = async (birdId) => {
    try {
      const { error } = await supabase.from('Birds').delete().eq('id', birdId);
      if (error) {
        throw error;
      }
      const { error: deletePhotoError } = await supabase.storage
        .from('Bird_Photos')
        .remove([`public/${birds.find((bird) => bird.id === birdId).link}.png`]);
      if (deletePhotoError) {
        throw deletePhotoError;
      }
      const { error: deleteIconError } = await supabase.storage
        .from('Bird_Icons')
        .remove([`${birdId}.png`]);
      if (deleteIconError) {
        throw deleteIconError;
      }
      fetchBirds();
    } catch (error) {
      console.error('Error deleting bird:', error.message);
    }

  };

  const clearForm = () => {
    setNewBird({
      id: null,
      name: '',
      species: '',
      description: '',
      link: '',
      photo: null,
      icon: null,
    });
    document.getElementById('photoInput').value = null;
    document.getElementById('iconInput').value = null;
  };

  const handleClearAll = () => {
    clearForm();
    setEditingBird(null);
  };

  return (
    <div>
      <h2>Bird Management</h2>
      <form onSubmit={editingBird ? handleSaveBird : handleCreateBird}>
        <h3>{editingBird ? 'Edit Bird' : 'Create Bird'}</h3>
        <input
          type="text"
          name="name"
          placeholder="Bird Name"
          value={newBird.name}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="species"
          placeholder="Species name"
          value={newBird.species}
          onChange={handleInputChange}
        />
        <textarea
          name="description"
          placeholder="Bird Description"
          value={newBird.description}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="link"
          placeholder="Bird Link"
          value={newBird.link}
          onChange={handleInputChange}
        />
        <input id="photoInput" type="file" accept="image/*" onChange={handlePhotoChange} />
        <input id="iconInput" type="file" accept="image/*" onChange={handleIconChange} />
        <button type="submit">{editingBird ? 'Save' : 'Create'}</button>
        {editingBird && <button type="button" onClick={handleCancelEdit}>Cancel</button>}
        <button type="button" onClick={handleClearAll}>Clear All</button>
      </form>
      <h3>Birds</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Species</th>
            <th>Description</th>
            <th>Link</th>
            <th>Photo</th>
            <th>Icon</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {birds.map((bird) => (
            <tr key={bird.id}>
              <td>{bird.name}</td>
              <td>{bird.species}</td>
              <td>{bird.description}</td>
              <td>{bird.link}</td>
              <td>
                {bird && (
                  <img
                    src={`${supabase.storage.url}/object/public/Bird_Photos/public/${bird.link}.png`}
                    alt={`Bird ${bird.name} from ${bird.link}`}
                    style={{ maxWidth: '100px' }}
                  />
                )}
              </td>
              <td>
                {bird && (
                  <img
                    src={`${supabase.storage.url}/object/public/Bird_Icons/${bird.id}.png`}
                    alt="Bird Icon"
                    style={{ maxWidth: '64px' }}
                  />
                )}
              </td>
              <td>
                <button onClick={() => handleUpdateBird(bird)}>Edit</button>
                <button onClick={() => handleDeleteBird(bird.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BirdManagement