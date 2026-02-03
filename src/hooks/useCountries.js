import { useEffect, useMemo, useState } from 'react';
import { loadCountries } from '../services/countriesIngestion';

export function useCountries() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await loadCountries();
        if (!isMounted) return;
        setCountries(data);
      } catch (e) {
        if (!isMounted) return;
        setError(e instanceof Error ? e : new Error('Falha ao carregar países'));
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  return useMemo(
    () => ({ countries, loading, error }),
    [countries, loading, error]
  );
}
