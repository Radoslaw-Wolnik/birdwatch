import React from 'react';
import './Home.css'

const Home = () => {
  return (
    <div className="home">
      <main>
        <section className="welcome">
          <h1>Welcome to Bird Watching App</h1>
          <p>Explore the world of birds with our app.</p>
          <img src="bird.jpg" alt="sth Bird" />
        </section>
      </main>
    </div>
  );
};

export default Home;