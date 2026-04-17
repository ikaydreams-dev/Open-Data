import { useState, useCallback, useEffect } from 'react'

/**
 * useLocalStorage — synced state that persists to localStorage.
 *
 * Behaves like useState but reads the initial value from localStorage and
 * writes back on every update. Handles JSON serialization automatically.
 * Safe in SSR (no window access at import time).
 *
 * @param {string}   key           localStorage key.
 * @param {*}        initialValue  Fallback when the key doesn't exist yet.
 * @returns {[value, setValue, removeValue]}
 *
 * @example
 * const [theme, setTheme, clearTheme] = useLocalStorage('theme', 'light')
 */
export function useLocalStorage(key, initialValue) {
    // Lazily read from storage on first render only
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key)
            return item !== null ? JSON.parse(item) : initialValue
        } catch {
            return initialValue
        }
    })

    // Write to storage whenever the value changes
    const setValue = useCallback(
        (value) => {
            try {
                // Accept a function updater exactly like useState
                const valueToStore =
                value instanceof Function ? value(storedValue) : value
                setStoredValue(valueToStore)
                window.localStorage.setItem(key, JSON.stringify(valueToStore))
            } catch (error) {
                console.warn(`useLocalStorage: failed to set "${key}"`, error)
            }
        },
        [key, storedValue],
    )

    // Delete the key and reset to initialValue
    const removeValue = useCallback(() => {
        try {
            window.localStorage.removeItem(key)
            setStoredValue(initialValue)
        } catch (error) {
            console.warn(`useLocalStorage: failed to remove "${key}"`, error)
        }
    }, [key, initialValue])

    // Sync across tabs: listen for storage events from other windows
    useEffect(() => {
        function handleStorageChange(e) {
            if (e.key !== key) return
                try {
                    setStoredValue(e.newValue !== null ? JSON.parse(e.newValue) : initialValue)
                } catch {
                    // Ignore malformed values from other tabs
                }
        }
        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, [key, initialValue])

    return [storedValue, setValue, removeValue]
}
