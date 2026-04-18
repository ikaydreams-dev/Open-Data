import { useState, useRef, useEffect } from 'react'
import { MOCK_USERNAMES } from '../../lib/constants'

export function MentionAutocomplete({ value, onChange, placeholder }) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [cursorPosition, setCursorPosition] = useState(0)
  const textareaRef = useRef(null)

  const handleChange = (e) => {
    const newValue = e.target.value
    const position = e.target.selectionStart
    setCursorPosition(position)
    onChange(newValue)

    // Check for @ mention
    const textBeforeCursor = newValue.slice(0, position)
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/)

    if (mentionMatch) {
      const query = mentionMatch[1].toLowerCase()
      const filtered = MOCK_USERNAMES.filter(username =>
        username.toLowerCase().includes(query)
      )
      setSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (username) => {
    const textBefore = value.slice(0, cursorPosition)
    const textAfter = value.slice(cursorPosition)
    const mentionMatch = textBefore.match(/@(\w*)$/)
    const beforeMention = textBefore.slice(0, -mentionMatch[0].length)
    const newValue = beforeMention + `@${username} ` + textAfter
    onChange(newValue)
    setShowSuggestions(false)
    textareaRef.current.focus()
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!textareaRef.current?.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 min-h-[100px] resize-y"
        rows={4}
      />

      {showSuggestions && (
        <div className="absolute z-10 w-48 bg-white border border-stone-300 rounded-md shadow-lg mt-1 max-h-40 overflow-y-auto">
          {suggestions.map((username) => (
            <button
              key={username}
              onClick={() => handleSuggestionClick(username)}
              className="w-full text-left px-3 py-2 hover:bg-stone-50 focus:bg-stone-50 focus:outline-none text-sm"
            >
              @{username}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}