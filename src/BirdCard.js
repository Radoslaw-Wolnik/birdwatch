import './BirdCard.css';
import { Link } from 'react-router-dom';
import { supabase } from './supabaseClient';

const BirdCard = ({ bird }) => {

  //console.log(bird.link);

  return (
    <div className="bird-card">
      <Link to={`/bird/${bird.link}`}>
        <h3 style={{ textAlign: 'left', margin: '0' }}>{bird.name}</h3>
        <img
          src={`${supabase.storage.url}/object/public/Bird_Photos/public/${bird.link}.png`}
          alt={`${bird.name} should be here`}
          className="post-image"
          onError={() => console.error(`Error loading photo ${bird.name} id ${bird.id}`)}
        />
      </Link>
    </div>
  );
};

export default BirdCard;