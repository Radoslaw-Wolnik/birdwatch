import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const CreditsManagement = () => {
  const [birdIcons, setBirdIcons] = useState([]);
  const [birdPhotos, setBirdPhotos] = useState([]);
  const [newCredit, setNewCredit] = useState({ author: '', img_id: null, link: '', img_src: '', name : ''});
  const [credits, setCredits] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: iconData, error: iconError } = await supabase
          .storage
          .from('Bird_Icons')
          .list(null, {
            limit: 10,
            offset: 0,
            });
        if (iconError) {
          throw(iconError);
        } else {
          setBirdIcons(iconData);
          console.log(iconData);
        }

        const { data: photoData, error: photoError } = await supabase
          .storage
          .from('Bird_Photos')
          .list('public/', {
            limit: 10,
            offset: 0,
            });
        if (photoError) {
          throw(photoError);
        } else {
          console.log(photoData);
          setBirdPhotos(photoData);
        }

        const { data : creditData, error : creditError} = await supabase.from('credits').select('*');
        if (creditError) {
          throw(creditError)
        } else {
          const creditDict = {};
          creditData.forEach(cred => {
            creditDict[cred.img_id] = {created_at : cred.created_at, author : cred.author, link : cred.link, src : cred.src};
          });
          setCredits(creditDict);
        }

    } catch (error) {
      console.error(`Error fetching data`, error.message);
    }
  };
  fetchData();
  }, []);

  const handleInputChange = (e) => {
    setNewCredit({ ...newCredit, [e.target.name]: e.target.value });
  };

  const handleSelect = ({id, s, n}) => {
    setNewCredit({ ...newCredit, img_id: id, src : s, name: n})
  }


  // not sure abt this one
  const makeCredit = async ({ img_id, author, src, link, name }) => {
    try {
      const { data, error } = await supabase
        .from('credits')
        .insert({ author, src: `${src}/${name}`, link, img_id })
        .select();
      if (error) {
        throw error;
      } else {
        setNewCredit({ author: '', img_id: null, link: '', img_src: '', name: '' });
        alert('Credit added successfully!');
        setCredits({ ...credits, [img_id]: {created_at : data[0].created_at, author : data[0].author, link : data[0].link, src : data[0].src} });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateCredit = async ({ img_id, author, link }) => {
    try {
      const { data, error } = await supabase
        .from('credits')
        .update({ author, link })
        .eq('img_id', img_id)
        .select();
      if (error) {
        throw error;
      } else {
        console.log(data);
        setNewCredit({ author: '', img_id: null, link: '', img_src: '', name: '' });
        alert('Credit updated successfully!');
        setCredits({ ...credits, [img_id]: {created_at : data[0].created_at, author : data[0].author, link : data[0].link, src : data[0].src} });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddCredit = async (e) => {
    e.preventDefault();
    if (newCredit.author && newCredit.img_id && newCredit.name) {
      if(credits[newCredit.img_id]){
        const old = credits[newCredit.img_id];
        if(old.name === newCredit.name && old.link === newCredit.link){
          console.log("nothing changed lol");
        } else{
          updateCredit(newCredit);
        }
      } else {
        makeCredit(newCredit);
      }
    } else {
      alert('Please fill in all fields.');
    }
  };

  return (
    <div>
      <h1>Manage Credits</h1>
      <form onSubmit={handleAddCredit}>
        <h3>Add or Change Credit</h3>
        <p>Selected: {newCredit.name}</p>
        <input
          type="text"
          name="author"
          placeholder="Author name"
          value={newCredit.author}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="link"
          placeholder="Link to website"
          value={newCredit.link}
          onChange={handleInputChange}
        />
        <button type="submit">Submit</button>
      </form>

      <h2>Bird Icons</h2>
      <table>
        <thead>
          <tr>
            <th>Image</th>
            <th>name</th>
            <th>Author</th>
            <th>Link</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {birdIcons.map((icon) => (
            <tr key={icon.name}>
              <td>{<img src={`${supabase.storage.url}/object/public/Bird_Icons/${icon.name}`} alt={icon.name} />}</td>
              <td>{icon.name}</td>
              <td>{credits[icon.id] ? (<>{credits[icon.id].author}</>) : (<>-----</>)}</td>
              <td>{credits[icon.id] ? (<>{credits[icon.id].link}</>) : (<>-----</>)}</td>
              <td><button onClick={() => handleSelect({id : icon.id, s: 'Bird_Icons', n : icon.name})}>Select</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Bird Photos</h2>
      <table>
        <thead>
          <tr>
            <th>Image</th>
            <th>name</th>
            <th>Credit</th>
            <th>Link</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {birdPhotos.map((photo) => (
            <tr key={photo.name}>
              <td>{<img src={`${supabase.storage.url}/object/public/Bird_Photos/public/${photo.name}`} alt={photo.name} />}</td>
              <td>{photo.name}</td>
              <td>{credits[photo.id] ? (<>{credits[photo.id].author}</>) : (<>-----</>)}</td>
              <td>{credits[photo.id] ? (<>{credits[photo.id].link}</>) : (<>-----</>)}</td>
              <td><button onClick={() => handleSelect({id : photo.id, s: 'Bird_Photos/public/', n : photo.name})}>Select</button></td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
};

export default CreditsManagement;