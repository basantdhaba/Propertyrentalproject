import React, { createContext, useContext, useState, useEffect } from "react"

interface Settings {
  upiId: string
  interestedFees: { maxRent: number; fee: number }[]
  mediaRequestFees: { maxRent: number; fee: number }[]
  socialLinks: {
    facebook: string
    twitter: string
    instagram: string
  }
}

interface SettingsContextType {
  settings: Settings
  updateSettings: (newSettings: Settings) => void
}

const defaultSettings: Settings = {
  upiId: "example@upi",
  interestedFees: [
    { maxRent: 10000, fee: 25 },
    { maxRent: 15000, fee: 49 },
    { maxRent: 20000, fee: 75 },
    { maxRent: Number.POSITIVE_INFINITY, fee: 99 },
  ],
  mediaRequestFees: [
    { maxRent: 10000, fee: 30 },
    { maxRent: 15000, fee: 55 },
    { maxRent: 20000, fee: 80 },
    { maxRent: Number.POSITIVE_INFINITY, fee: 110 },
  ],
  socialLinks: {
    facebook: "https://facebook.com/rentease",
    twitter: "https://twitter.com/rentease",
    instagram: "https://instagram.com/rentease",
  },
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings)

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem("appSettings")
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings))
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage:", error)
    }
  }, [])

  const updateSettings = (newSettings: Settings) => {
    try {
      setSettings(newSettings)
      localStorage.setItem("appSettings", JSON.stringify(newSettings))
    } catch (error) {
      console.error("Failed to save settings to localStorage:", error)
    }
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  )
        }
      
