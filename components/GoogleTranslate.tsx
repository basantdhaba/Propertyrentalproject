"use client"

import { useEffect } from "react"

declare global {
  interface Window {
    googleTranslateElementInit: () => void
    google: any
  }
}

export default function GoogleTranslate() {
  useEffect(() => {
    // Define the initialization function for Google Translate
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "hi,gu,bn,pa,ta,te,kn,ml,mr,ur,or,as,sa", // Indian languages
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        "google_translate_element",
      )
    }

    // Add the Google Translate script to the page
    const script = document.createElement("script")
    script.type = "text/javascript"
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
    script.async = true
    document.body.appendChild(script)

    // Clean up function
    return () => {
      // Remove the script when component unmounts
      document.body.removeChild(script)
      delete window.googleTranslateElementInit
    }
  }, [])

  return <div id="google_translate_element" className="google-translate-container"></div>
}

