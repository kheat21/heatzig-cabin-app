export const saveToStorage = (key: string, data: any) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data))
      console.log(`✅ Saved ${key}:`, data)
      return true
    }
  } catch (error) {
    console.error(`❌ Error saving ${key}:`, error)
    return false
  }
}

export const loadFromStorage = (key: string, defaultValue: any) => {
  try {
    if (typeof window !== 'undefined') {
      const item = localStorage.getItem(key)
      if (item) {
        console.log(`✅ Loaded ${key}`)
        return JSON.parse(item)
      }
    }
  } catch (error) {
    console.error(`❌ Error loading ${key}:`, error)
  }
  console.log(`ℹ️ Using default for ${key}`)
  return defaultValue
}
