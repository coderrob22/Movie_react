import { useEffect } from "react";

export function useKey(key, action) {
    useEffect(
        function(){
          function callback(x){
            if(x.code.toLowerCase() === key.toLowerCase()){
              action();
            }
          }
          
          document.addEventListener('keydown', callback )
          
          //clean up function
          return function(){
            document.removeEventListener('keydown', callback)
          }
        }, [action, key]
      );
}