// Get the browser language
export const getBrowserLanguage = (): string => {
  if (typeof window === "undefined") return "en" // Default to English on server

  const browserLang = navigator.language || (navigator as any).userLanguage
  return browserLang.split("-")[0] // Get the language code part (e.g., 'en' from 'en-US')
}

// Check if the language is an Indian language
export const isIndianLanguage = (langCode: string): boolean => {
  const indianLanguageCodes = ["hi", "bn", "ta", "te", "mr", "gu", "kn", "ml", "pa", "or"]
  return indianLanguageCodes.includes(langCode)
}

// Get language name from code
export const getLanguageName = (langCode: string): string => {
  const languageMap: Record<string, string> = {
    en: "English",
    hi: "हिन्दी (Hindi)",
    bn: "বাংলা (Bengali)",
    ta: "தமிழ் (Tamil)",
    te: "తెలుగు (Telugu)",
    mr: "मराठी (Marathi)",
    gu: "ગુજરાતી (Gujarati)",
    kn: "ಕನ್ನಡ (Kannada)",
    ml: "മലയാളം (Malayalam)",
    pa: "ਪੰਜਾਬੀ (Punjabi)",
    or: "ଓଡ଼ିଆ (Odia)",
  }

  return languageMap[langCode] || "English"
}

// Store user language preference
export const setUserLanguagePreference = (langCode: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("userLanguage", langCode)
  }
}

// Get user language preference
export const getUserLanguagePreference = (): string => {
  if (typeof window === "undefined") return "en"

  return localStorage.getItem("userLanguage") || "en"
}

