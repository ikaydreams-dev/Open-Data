import React from 'react'

/**
 * SearchBar component for entering a query and submitting search requests.
 */
export function SearchBar({ query, onChange, onSubmit, placeholder = 'Search…' }) {
  return (
    <form className="search-bar" onSubmit={onSubmit}>
      <label htmlFor="search-input" className="sr-only">
        Search
      </label>
      <div className="search-bar__field">
        <input
          id="search-input"
          type="search"
          value={query}
          onChange={onChange}
          placeholder={placeholder}
          className="search-bar__input"
          aria-label="Search"
        />
        <button type="submit" className="search-bar__button">
          Search
        </button>
      </div>
    </form>
  )
}
