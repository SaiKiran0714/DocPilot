import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchLetters } from '../services/letterService.js';

export function useLetters(providerFilterValue = '') {
  const [letters, setLetters] = useState([]);
  const [isLoadingLetters, setIsLoadingLetters] = useState(false);
  const [lettersErrorMessage, setLettersErrorMessage] = useState('');

  const loadLetters = useCallback(async () => {
    try {
      setIsLoadingLetters(true);
      setLettersErrorMessage('');
      console.log('[useLetters] Loading letters with provider filter:', providerFilterValue);
      const loadedLetters = await fetchLetters(providerFilterValue);
      console.log('[useLetters] Loaded letters count:', loadedLetters.length);
      setLetters(loadedLetters);
    } catch (error) {
      console.error('[useLetters] Failed to load letters:', error);
      setLettersErrorMessage(error.message || 'Failed to load letters.');
    } finally {
      setIsLoadingLetters(false);
    }
  }, [providerFilterValue]);

  useEffect(() => {
    loadLetters();
  }, [loadLetters]);

  const groupedLettersByProvider = useMemo(() => {
    return letters.reduce((groupedLetters, letter) => {
      const providerName = letter.provider || 'Unknown Provider';
      groupedLetters[providerName] = groupedLetters[providerName] || [];
      groupedLetters[providerName].push(letter);
      return groupedLetters;
    }, {});
  }, [letters]);

  return {
    letters,
    groupedLettersByProvider,
    isLoadingLetters,
    lettersErrorMessage,
    reloadLetters: loadLetters
  };
}
