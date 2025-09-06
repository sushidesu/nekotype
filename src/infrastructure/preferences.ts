export type UserPreferences = {
  editorLayout: "vertical" | "horizontal"
}

const STORAGE_KEY = "nekotype-preferences"

const defaultPreferences: UserPreferences = {
  editorLayout: "vertical",
}

export const preferences = {
  get(): UserPreferences | undefined {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return undefined

      const parsed: unknown = JSON.parse(stored)
      if (typeof parsed === "object" && parsed !== null) {
        return { ...defaultPreferences, ...parsed }
      }
      return undefined
    } catch (error) {
      console.error("Failed to load preferences:", error)
      return undefined
    }
  },

  save(updates: Partial<UserPreferences>): void {
    try {
      const current = this.get() ?? defaultPreferences
      const updated = { ...current, ...updates }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch (error) {
      console.error("Failed to save preferences:", error)
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error("Failed to clear preferences:", error)
    }
  },
}
