


import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import { gsap } from 'gsap';

function App() {
  const buttonRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Set default GSAP tween settings to make animations smoother
  gsap.defaults({
    duration: 0.3, // Default duration for all animations
    ease: 'power2.out', // Default easing for all animations
  });

  // Button animations with isTweening and killTweensOf to prevent overlapping animations
  useEffect(() => {
    const button = buttonRef.current;
    const ctx = gsap.context(() => {
      // Hover animation
      button.addEventListener('mouseenter', () => {
        if (!gsap.isTweening(button)) {
          gsap.to(button, { scale: 1.2 });
        }
      });
    
      button.addEventListener('mouseleave', () => {
        if (!gsap.isTweening(button)) {
          gsap.to(button, { scale: 1 });
        }
      });

      // Click animation
      button.addEventListener('click', () => {
        if (!gsap.isTweening(button)) {
          const tl = gsap.timeline();
          tl.to(button, { scale: 0.7, duration: 0.1 })
            .to(button, { scale: 1, duration: 0.2 });
        }
      });
    }, buttonRef);  // The context ensures proper cleanup on unmount

    return () => ctx.revert(); // Cleanup GSAP context when the component unmounts
  }, []);

  // Card animations
  useEffect(() => {
    gsap.from('.movie-card', {
      y: -50,
      opacity: 0,
      stagger: 0.2,
    });
  }, [movies]);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async (term = '') => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`https://imdb.iamidiotareyoutoo.com/search?q=${term || 'Spiderman'}`);
      console.log("API Response:", response.data);
      if (Array.isArray(response.data.description)) {
        setMovies(response.data.description);
      } else if (response.data.movies) {
        setMovies(response.data.movies);
      } else {
        setMovies([]);
        setError('No movies.');
      }
    } catch (err) {
      setError('Error, Please try again. 404');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchMovies(searchTerm);
  };

  return (
    <>

    <h2 style={{fontStyle:"italic",fontSize:"50px"}}>Movies Collection</h2>
      <input
        style={{marginBottom:'50px'}}
        type="text" 
        value={searchTerm} 
        onChange={(e) => setSearchTerm(e.target.value)} 
        placeholder="Search for a movie bro............................" 
      />
      <button ref={buttonRef} onClick={handleSearch}>Search</button>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      <div className="movie-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 3fr)', gap: '16px' }}>
        {movies.map((movie, index) => (
          <div className="movie-card" key={movie.id ? movie.id : `${movie.title}-${movie.year}-${index}`}>
            <img src={movie['#IMG_POSTER']} alt={movie.title} />
            <h2>{movie.title}</h2>
            <p>Rating: {movie['#RANK']}</p>
            <p>Year: {movie['#YEAR']}</p>
            <p>Actors: {movie['#ACTORS']}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
