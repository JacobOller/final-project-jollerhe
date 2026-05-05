// File to handle the storage of the username.

export const STORAGE_KEY = 'cs2500.activeUsername'

// Function to read the stored username.
// If the username is not found, then return an empty string.
export function readStoredUsername() {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

// Function to write the stored username.
// If the value is not provided, then remove the username from the storage.
export function writeStoredUsername(value) {
  try {
    if (value) {
      localStorage.setItem(STORAGE_KEY, value)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // Ignore
  }
}
