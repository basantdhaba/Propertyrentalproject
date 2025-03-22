"use client"

import { useState, useEffect } from "react"
import { Globe } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

// Define Indian languages
const indianLanguages = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिन्दी (Hindi)" },
  { code: "bn", name: "বাংলা (Bengali)" },
  { code: "ta", name: "தமிழ் (Tamil)" },
  { code: "te", name: "తెలుగు (Telugu)" },
  { code: "mr", name: "मराठी (Marathi)" },
  { code: "gu", name: "ગુજરાતી (Gujarati)" },
  { code: "kn", name: "ಕನ್ನಡ (Kannada)" },
  { code: "ml", name: "മലയാളം (Malayalam)" },
  { code: "pa", name: "ਪੰਜਾਬੀ (Punjabi)" },
  { code: "or", name: "ଓଡ଼ିଆ (Odia)" },
]

declare global {
  interface Window {
    googleTranslateElementInit: () => void
    google: any
  }
}

export default function LanguageSelector() {
  const [isTranslateScriptLoaded, setIsTranslateScriptLoaded] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("en")

  // Load Google Translate script
  useEffect(() => {
    // Skip if already loaded
    if (document.getElementById("google-translate-script")) {
      setIsTranslateScriptLoaded(true)
      return
    }

    // Create hidden div for Google Translate
    const translateDiv = document.createElement("div")
    translateDiv.id = "google_translate_element"
    translateDiv.style.display = "none"
    document.body.appendChild(translateDiv)

    // Initialize Google Translate
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: indianLanguages.map((lang) => lang.code).join(","),
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        "google_translate_element",
      )
      setIsTranslateScriptLoaded(true)
    }

    // Load Google Translate script
    const script = document.createElement("script")
    script.id = "google-translate-script"
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
    script.async = true
    document.body.appendChild(script)

    // Cleanup
    return () => {
      const translateDiv = document.getElementById("google_translate_element")
      const script = document.getElementById("google-translate-script")
      if (translateDiv) document.body.removeChild(translateDiv)
      if (script) document.body.removeChild(script)
      delete window.googleTranslateElementInit
    }
  }, [])

  // Handle language change
  const changeLanguage = (langCode: string) => {
    if (!isTranslateScriptLoaded) return

    // Find the iframe created by Google Translate
    const iframe = document.querySelector(".goog-te-menu-frame") as HTMLIFrameElement
    if (!iframe) return

    // Get the document inside the iframe
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
    if (!iframeDoc) return

    // Find and click the language option
    const languageOption = iframeDoc.querySelector(`a[href*="setLang=${langCode}"]`) as HTMLAnchorElement
    if (languageOption) {
      languageOption.click()
      setSelectedLanguage(langCode)
    }
  }

  // Direct language change using Google Translate API
  const changeLanguageDirectly = (langCode: string) => {
    if (!isTranslateScriptLoaded || !window.google?.translate) return

    // If selecting English, restore original
    if (langCode === "en") {
      const selectElement = document.querySelector(".goog-te-combo") as HTMLSelectElement
      if (selectElement) {
        selectElement.value = "en"
        selectElement.dispatchEvent(new Event("change"))
      }
    } else {
      // Use the Google Translate API to change the language
      const translateElement = window.google.translate.TranslateElement
      if (translateElement) {
        translateElement.getInstance().setLanguage(langCode)
      }
    }

    setSelectedLanguage(langCode)
  }

  // Find the language name by code
  const getLanguageName = (code: string) => {
    const language = indianLanguages.find((lang) => lang.code === code)
    return language ? language.name : "English"
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
          <Globe className="h-4 w-4" />
          <span className="sr-only">Select language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {indianLanguages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => {
              // Try both methods
              changeLanguage(language.code)
              changeLanguageDirectly(language.code)
            }}
            className={selectedLanguage === language.code ? "bg-accent" : ""}
          >
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

