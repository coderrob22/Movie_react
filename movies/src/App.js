import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";

const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "f84fc31d";
const tempquery = "interstellar"

export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState(tempMovieData);
  const [watched, setWatched] = useState(tempWatchedData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedID, setSelectedID] = useState(null);

  function handleSelectedMovie(id) {
    setSelectedID((selectedID) => (id === selectedID ? null : id));
  }

  function handleCloseMovie(){
    selectedID(null);
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie])
  }

  function handleDeleteWatched(id){
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  //************************ Effect for managing local storage using react useEffects *****************************
  useEffect(function () {
    localStorage.setItem("watched", JSON.stringify(watched))
  },[watched]
);

  useEffect(
    function() {
      const controller = new AbortController()
    async function fetchMovies() {
      try {
      setIsLoading(true);
      setError("")

      const res = await fetch(
        `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`, {signal: controller.signal}
      );

      // ********************************Error handling **************************************************
      if (!res.ok)
        throw new Error ("Something went wrong with fetching movies");

      const data = await res.json();

      if (data.Response === "False") throw new Error("Movie not found");

      setMovies(data.Search);
      setIsLoading(false);
    } catch (err){
      if (err.name !== "AbortError"){
        setError(err.message)
      }
    } finally {
      setIsLoading(false);
    }
  }
  if (!query.length) {
    setMovies([]);
    setError("");
    return;
  }
    fetchMovies();

    //Clean up function for the useEffect above, using the abort controller to stop RACE conditions (where based on the keystrokes and data fetching, there are competing requests calling the data and using up network bandwith)
    return function(){
      controller.abort();
    }
  }, [query]);

  return (
    <>
      <NavBar>
        <Logo />
        <Search query={query} setQuery={setQuery}/>
        <NumResults movies={movies}/>
      </NavBar>
      <Main>
        <Box>
          {/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}
          {isLoading && 
          <Loader />}
          {!isLoading && !error && 
          <MovieList 
          movies={movies} onSelectedMovie={handleSelectedMovie}/>}
          {error && 
          <ErrorMessage message={error} />}
        </Box>
        <Box>
          {
            selectedID ? (
              <MovieDetails 
                selectedID={selectedID} 
                onCloseMovie={handleCloseMovie}
                onAddWatched={handleAddWatched}
                watched={watched}
                /> 
            ) : (
              <>
                <Summary watched={watched}/>
                <WatchedMoviesList 
                  watched={watched}
                  onDeleteWatched={handleDeleteWatched}
                />
              </>
            )}
        </Box>
      </Main>
    </>
  );
}

function Loader() {
  return <p className="loader">Loading...</p>
}
function ErrorMessage ({message}){
  return(
    <p className="error">
      
      <span>🚨</span> {message}
    </p>
  );
}

function NavBar({children}) {
  
  return(
    <nav className="nav-bar">
        {children}
      </nav>
  )
}

function NumResults({movies}){
  return(
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  )
}

function Logo(){
  return(
    <div className="logo">
          <span role="img">🍿</span>
          <h1>usePopcorn</h1>
        </div>
  )
}

function Search({query, setQuery}){
  const inputEl = useRef(null);

  useEffect(function(){

    function callback(e){
      if (document.activeElement === inputEl.current)
        return;
      if (e.code === 'Enter'){
        inputEl.current.focus();
        setQuery("");
      }
    }

    document.addEventListener('keydown', callback);

    return () => document.addEventListener("keydown", callback);
  }, [setQuery])

  return(
    <input
          className="search"
          type="text"
          placeholder="Search movies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          ref={inputEl}
        />
  )
};

function Main({children}){
  const [watched, setWatched] = useState(tempWatchedData);
  const [isOpen2, setIsOpen2] = useState(true);

  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));


  return(
    <main className="main">
      {children}
    </main>
  )
};

function Box({children}){
  const [isOpen, setIsOpen] = useState(true);
  
  return(
    <div className="box">
          <button
            className="btn-toggle"
            onClick={() => setIsOpen((open) => !open)}
            >
            {isOpen ? "–" : "+"}
          </button>
          {isOpen && (
            children
          )}
        </div>
  )
};

function MovieList({movies, onSelectMovie}){
  return(
    <ul className="list list-movies">
              {movies?.map((movie) => (
                <Movie 
                  movie={movie} 
                  key={movie.imdbID}
                  onSelectMovie={onSelectMovie}/>
              ))}
            </ul>
  )
}

function Movie({movie, onSelectMovie}) {
  return(
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  )
}

// function WatchBox() {
//   const [isOpen2, setIsOpen2] = useState(true);
//   const [watched, setWatched] = useState(tempWatchedData);

//   return(
//     <div className="box">
//           <button
//             className="btn-toggle"
//             onClick={() => setIsOpen2((open) => !open)}
//           >
//             {isOpen2 ? "–" : "+"}
//           </button>
//           {isOpen2 && (
//             <>
//               <Summary watched={watched}/>
//               <WatchedMoviesList watched={watched}/>
//             </>
//           )}
//         </div>
//   )
// };

function Summary({watched}) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return(
    <div className="summary">
                <h2>Movies you watched</h2>
                <div>
                  <p>
                    <span>#️⃣</span>
                    <span>{watched.length} movies</span>
                  </p>
                  <p>
                    <span>⭐️</span>
                    <span>{avgImdbRating.toFixed(2)}</span>
                  </p>
                  <p>
                    <span>🌟</span>
                    <span>{avgUserRating.toFixed(2)}</span>
                  </p>
                  <p>
                    <span>⏳</span>
                    <span>{avgRuntime} min</span>
                  </p>
                </div>
              </div>
  )
};

function MovieDetails({ selectedID, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState('')

  //This watched prop is an array of movies that have been watched. Map over this array and see if the selected movie is included in this array already.
  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedID);
  const watchedUserRating = watched.find((movie) => movie.imdbID === selectedID)?.userRating

  const{
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Directors: directors,
    Genre: genre,
  } = movie;

const [avgRating, setAvgRating] = useState(0);

function handleAdd(){
  const newWatchedMovie = {
    imdbID: selectedID,
    title,
    year,
    poster,
    imdbRating: Number(imdbRating),
    runtime: Number(runtime.split(" ").at(0)),
    userRating, 
  };

  onAddWatched(newWatchedMovie);
  onCloseMovie();
}

 useEffect(
    function(){
      function callback(x){
        if(x.code === 'Escape'){
          onCloseMovie();
        }
      }
      
      document.addEventListener('keydown', callback )
      
      //clean up function
      return function(){
        document.removeEventListener('keydown', callback)
      }
    }, [onCloseMovie]
  );

 useEffect(
  function() {
    async function getMovieDetails() {
      setIsLoading(true);
      const res = await fetch(
        `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedID}`
      );
      const data = await res.json();
      setMovie(data);
      setIsLoading(false);
    }
    getMovieDetails();
  }, [selectedID])

  //The array dependency is necessary to make sure the app refreshes when a new title is passed in otherwise it will only refresh on mount despite picking different movie titles
  useEffect(
    function() {
      if(!title) return;
      document.title = `Movie | ${title}`;

      //This is the cleanup function, its used to 'clean up' the effects of using the use effect... like side effects
      return function (){
        document.title = 'usePopcorn';
      }
    }, [title]
  );

  return(
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
      <>
      <header> 

      <button className="btn-back" onClick={onCloseMovie}>
        &larr;
      </button>
        <img src={poster} alt={`Poster of ${movie} movie`} />
        <div className="details-overview">
          <h2>{title}</h2>
          <p>
            {released} &bull; {runtime}
          </p>
          <p>{genre}</p>
          <p>
            <span>⭐️</span>
              {imdbRating} IMDb Rating
          </p>
        </div>
      
      </header>



      <section>
        <div className="rating">
        {!isWatched ? 
        <>
          <StarRating 
            maxRating={10} 
            size={24}
            onSetRating={setUserRating}
          />
          {userRating > 0 && (
            <button className="btn-add" onClick={handleAdd}>+ Add to List</button>
          )}
        </> : 
        (
          <p>You rated this movie {watchedUserRating}</p>
        )}
        </div>
        <p><em>{plot}</em></p>
        <p>Starring {actors}</p>
        <p>Directed by {directors}</p>
      </section>
      </>
      )}
    </div>
  )
};

function WatchedMoviesList({watched, onDeleteWatched}){
  return(
    <ul className="list">
                {watched.map((movie) => (
                  <WatchedMovie 
                    movie={movie} 
                    key={movie.imdbID}
                    onDeleteWatched={onDeleteWatched}
                  />
                ))}
              </ul>
  )
}

function WatchedMovie({movie, onDeleteWatched}){
  return(
    <li>
                    <img src={movie.poster} alt={`${movie.title} poster`} />
                    <h3>{movie.title}</h3>
                    <div>
                      <p>
                        <span>⭐️</span>
                        <span>{movie.imdbRating}</span>
                      </p>
                      <p>
                        <span>🌟</span>
                        <span>{movie.userRating}</span>
                      </p>
                      <p>
                        <span>⏳</span>
                        <span>{movie.runtime} min</span>
                      </p>
                      <button 
                        className="btn-delete" 
                        onClick={() => onDeleteWatched(movie.imdbID)}>X</button>
                    </div>
                  </li>
  )
}