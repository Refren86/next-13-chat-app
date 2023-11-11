import { useState } from 'react';

export const useFilter = () => {
  const [searchWord, setSearchWord] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchWord(e.target.value);
  };

  return {
    searchWord,
    handleSearch,
  };
};
