import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const Credits = () => {
  const [credits, setCredits] = useState([]);

  useEffect(() => {
    const fetchCredits = async () => {
      const { data, error } = await supabase.from('credits').select('*');
      if (error) {
        console.error('Error fetching credits:', error.message);
      } else {
        setCredits(data);
      }
    };

    fetchCredits();
  }, []);

  return (
    <div>
      <h1>Credits</h1>
      <table>
        <thead>
          <tr>
            <th>Image</th>
            <th>Author</th>
            <th>link</th>
          </tr>
        </thead>
        <tbody>
        {credits.map((credit) => (
          <tr key={credit.id}>
            <td>{credit.src && <img src={`${supabase.storage.url}/object/public/${credit.src}`} alt={credit.author} />}</td>
            <td>{credit.author}</td>
            <td>{credit.link && (
              <p>
                <a href={credit.link} target="_blank" rel="noopener noreferrer">
                  Link
                </a>
              </p>
            )}
          </td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
};

export default Credits;