import React, { useState } from 'react';

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
        style={{ width: '100%', padding: '8px', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
      />
    </div>
  );
};

export default GeneralSearch;
