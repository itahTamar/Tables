import React, { useState } from 'react';

interface GeneralSearchProps<T> {
  items: T[]; // Array of any structure items to search through
  placeholder?: string;
  searchKeys?: (keyof T)[]; // Optional list of keys to search within each item
  onSelectResult?: (result: T) => void; // Callback for selecting a result
}

function GeneralSearch<T extends Record<string, any> | any[]>({
  items,
  placeholder = "Search...",
  searchKeys,
  onSelectResult,
}: GeneralSearchProps<T>) {
  const [query, setQuery] = useState<string>('');

  const filteredResults = items.filter((item) => {
    const searchableValues = searchKeys
      ? searchKeys.map((key) => item[key]) // Access specified keys
      : Object.values(item); // Default to all values

    return searchableValues.some((value) =>
      String(value).toLowerCase().includes(query.toLowerCase())
    );
  });

  const handleSelect = (result: T) => {
    onSelectResult?.(result);
  };

  return (
    <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        style={{ width: '100%', padding: '8px', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
      />
      {filteredResults.length > 0 && (
        <ul style={{ listStyleType: 'none', padding: 0, marginTop: '8px', border: '1px solid #ddd', borderRadius: '4px' }}>
          {filteredResults.map((result, index) => (
            <li
              key={index}
              onClick={() => handleSelect(result)}
              style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
            >
              {JSON.stringify(result)}
            </li>
          ))}
        </ul>
      )}
      {query && filteredResults.length === 0 && <p>No results found.</p>}
    </div>
  );
}

export default GeneralSearch;
