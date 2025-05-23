import React, { useState } from 'react';

//component that search in the client side only
interface GeneralSearchProps {
  onSearchResults: (results: string[]) => void; // Callback to return search results
  placeholder?: string;
}

const GeneralSearch: React.FC<GeneralSearchProps> = ({
  onSearchResults,
  placeholder = "Search...",
}) => {
  const [query, setQuery] = useState<string>('');
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null); // Correct type for the timer

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (timer) clearTimeout(timer); // Clear previous timer

    // Set a new timer for 1 seconds
    const newTimer = setTimeout(() => {
      if (e.target.value) {
        onSearchResults([e.target.value]); // Trigger search with query
      } else {
        onSearchResults([]); // No query, return empty results
      }
    }, 1000);

    setTimer(newTimer);
  };

  return (
    <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="inputSearch"
      />
    </div>
  );
};

export default GeneralSearch;
