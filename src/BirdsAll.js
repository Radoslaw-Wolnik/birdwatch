import React, { useState, useEffect} from 'react';
import useFetchNames from './useFetchNames';
import BirdCard from './BirdCard';
import { supabase } from './supabaseClient';
import './Birds.css';

const Popup = ({ show }) => {
  return show ? (
    <div className="popup">
      <p>Number of images in a row</p>
    </div>
  ) : null;
};

const BirdsAll = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectorClicked, setSelectorClicked] = useState(false);
  const [numImagesInRow, setNumImagesInRow] = useState(4);
  const { birdNames, loading, error } = useFetchNames();
  const [birdLinks, setBirdLinks] = useState({});

  const filteredBirds = Object.entries(birdNames)
    .filter(([id, name]) =>
      name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map(([id, name]) => ({ id, name }));


  const handleSelectChange = (event) => {
    setNumImagesInRow(parseInt(event.target.value));
  };

  useEffect(() => {
    const fetchBirdLinks = async () => {
      try {
        const { data: birds, error: birdsError } = await supabase
          .from('Birds')
          .select('id, link');

        if (birdsError) {
          throw birdsError;
        }

        const birdLinksDict = {};
        birds.forEach(bird => {
          birdLinksDict[bird.id] = bird.link;
        });

        setBirdLinks(birdLinksDict);
      } catch (error) {
        console.error('Error fetching bird names:', error.message);
      }
    };

    fetchBirdLinks();
  }, []);


  return (
    <div className="birds">
      <main>
        <section>
          <div className="search-container">
            <div className="search-bar">
              <input
                type="text"
                className="search-input"
                placeholder="Search by phrase (name or part of name)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="images-in-row">
            <div className="num-images-select-container">
              <select
                id="numImages"
                className="num-images-select"
                value={numImagesInRow}
                onChange={handleSelectChange}
                onFocus={() => setSelectorClicked(true)}
                onBlur={() => setSelectorClicked(false)}
              >
                {[...Array(10)].map((_, index) => (
                  <option key={index} value={index + 1}>
                    {index + 1}
                  </option>
                ))}
              </select>
              <Popup show={selectorClicked} />
              </div>
            </div>
            
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>Error: {error}</p>
          ) : (
            <div
              className="birds-grid"
              style={{ '--num-columns': numImagesInRow }}
            >
              {filteredBirds.map((bird, index) => (
                <BirdCard key={index} bird={{link: birdLinks[bird.id], id : bird.id, name : bird.name}} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default BirdsAll;