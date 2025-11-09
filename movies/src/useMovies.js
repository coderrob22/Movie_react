import { useState, useEffect } from "react";

const KEY = "f84fc31d";

export function useMovies(query) {
    const [movies, setMovies] = useState(tempMovieData);
      const [watched, setWatched] = useState(tempWatchedData);
      const [isLoading, setIsLoading] = useState(false);
      const [error, setError] = useState("");

    useEffect(
        function() {
            // callback?.();
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
      }, [query]
    );
    return {movies, isLoading, error}
} 