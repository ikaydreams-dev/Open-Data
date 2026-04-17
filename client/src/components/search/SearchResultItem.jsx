import React from 'react'

/**
 * SearchResultItem renders a single result card with metadata.
 */
export function SearchResultItem({ item }) {
  if (!item) return null

  const title = item.title || item.name || 'Untitled'
  const description = item.description || item.summary || item.bio || 'No description available.'
  const metadata = item.type || item.category || 'Result'
  const date = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : null

  return (
    <article className="search-result-item">
      <div className="search-result-item__header">
        <h3 className="search-result-item__title">{title}</h3>
        <span className="search-result-item__meta">{metadata}</span>
      </div>

      <p className="search-result-item__description">{description}</p>

      <div className="search-result-item__footer">
        {date && <time className="search-result-item__date">{date}</time>}
        {item.url && (
          <a href={item.url} className="search-result-item__link" target="_blank" rel="noreferrer">
            View
          </a>
        )}
      </div>
    </article>
  )
}
