import { useEffect } from "react";
import { useState } from "react"
import http from "../../../client/src/api/http";

const useFetch = (url) => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  useEffect(() => {
    setLoading(true); 
    http.get(url)
    .then((response) => {
        setData(response.data)
    })
    .catch((err) => {
        setError(err)
    })
    .finally(() => {
        setLoading(false)
    })
  }, [url])


  return { data, loading, error }
}

export default useFetch